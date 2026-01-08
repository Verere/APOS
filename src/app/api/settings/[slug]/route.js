import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connectDB from '@/utils/connectDB';
import StoreSettings from '@/models/storeSettings';
import Store from '@/models/store';
import StoreMembership from '@/models/storeMembership';

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
        allowPriceAdjustment: false
      });
      settings = settings.toObject();
    }

    return NextResponse.json({ settings });
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

    // Update or create settings
    let settings = await StoreSettings.findOne({ slug });
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, body);
      await settings.save();
    } else {
      // Create new settings
      settings = await StoreSettings.create({
        storeId: store._id,
        slug: slug,
        ...body
      });
    }

    return NextResponse.json({ 
      success: true, 
      settings: settings.toObject(),
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
