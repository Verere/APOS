import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connectDB from '@/utils/connectDB';
import StoreSettings from '@/models/storeSettings';
import Store from '@/models/store';
import StoreMembership from '@/models/storeMembership';
import Customer from '@/models/customer';

function normalizePriceTypes(rawPriceTypes) {
  if (!Array.isArray(rawPriceTypes)) return [];

  return rawPriceTypes
    .map((pt) => ({
      id: String(pt?.id || '').trim(),
      name: String(pt?.name || '').trim(),
      active: pt?.active !== false
    }))
    .filter((pt) => pt.id && pt.name);
}

async function getPriceTypeUsageMap(storeId) {
  const usage = await Customer.aggregate([
    { $match: { storeId, isDeleted: false, priceTypeId: { $nin: [null, ''] } } },
    { $group: { _id: '$priceTypeId', count: { $sum: 1 } } }
  ]);

  return usage.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    await connectDB();

    const store = await Store.findOne({ slug }).lean();
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if user has access to this store
    const membership = await StoreMembership.findOne({
      userId: session.user.id,
      storeId: store._id
    }).lean();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let settings = await StoreSettings.findOne({ slug }).lean();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await StoreSettings.create({
        storeId: store._id,
        slug: slug,
        allowCreditSales: true,
        allowPriceAdjustment: false,
        allowPriceTypeSelection: false,
        allowDecimalQuantity: false,
        priceTypes: [],
        defaultPriceTypeId: null,
        receiptFontFamily: 'monospace',
        receiptFontSize: 12,
        receiptFooterNote: '',
        receiptSpecialNote: ''
      });
      settings = settings.toObject();
    }

    const priceTypeUsage = await getPriceTypeUsageMap(store._id);

    return NextResponse.json({ settings, priceTypeUsage });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    await connectDB();

    const store = await Store.findOne({ slug }).lean();
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if user is owner (only owners can modify settings)
    const membership = await StoreMembership.findOne({
      userId: session.user.id,
      storeId: store._id
    }).lean();

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only store owners can modify settings' }, { status: 403 });
    }

    const normalizedPriceTypes = normalizePriceTypes(body.priceTypes);
    const ids = normalizedPriceTypes.map((pt) => pt.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      return NextResponse.json({ error: 'Price type IDs must be unique.' }, { status: 400 });
    }

    const defaultPriceTypeId = body.defaultPriceTypeId ? String(body.defaultPriceTypeId).trim() : null;
    if (defaultPriceTypeId) {
      const defaultType = normalizedPriceTypes.find((pt) => pt.id === defaultPriceTypeId);
      if (!defaultType) {
        return NextResponse.json({ error: 'Default price type must exist in price types.' }, { status: 400 });
      }
      if (!defaultType.active) {
        return NextResponse.json({ error: 'Archived price types cannot be selected as default.' }, { status: 400 });
      }
    }

    const assignedPriceTypeIds = await Customer.distinct('priceTypeId', {
      storeId: store._id,
      isDeleted: false,
      priceTypeId: { $nin: [null, ''] }
    });
    const assignedSet = new Set(assignedPriceTypeIds.map(String));

    // Update or create settings
    let settings = await StoreSettings.findOne({ slug });
    
    if (settings) {
      const existingIds = new Set((settings.priceTypes || []).map((pt) => String(pt.id)));
      const incomingIds = new Set(normalizedPriceTypes.map((pt) => String(pt.id)));
      const deletedIds = [...existingIds].filter((id) => !incomingIds.has(id));
      const deletingAssigned = deletedIds.find((id) => assignedSet.has(id));
      if (deletingAssigned) {
        return NextResponse.json({ error: `Cannot delete price type '${deletingAssigned}' because it is assigned to customers.` }, { status: 400 });
      }

      // Update existing settings
      Object.assign(settings, {
        ...body,
        priceTypes: normalizedPriceTypes,
        defaultPriceTypeId
      });
      await settings.save();
    } else {
      // Create new settings
      settings = await StoreSettings.create({
        storeId: store._id,
        slug: slug,
        ...body,
        priceTypes: normalizedPriceTypes,
        defaultPriceTypeId
      });
    }

    const priceTypeUsage = await getPriceTypeUsageMap(store._id);

    return NextResponse.json({ 
      success: true, 
      settings: settings.toObject(),
      priceTypeUsage,
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
