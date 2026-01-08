import { NextResponse } from 'next/server';
import connectDB from '@/utils/connectDB';
import SubscriptionPackage from '@/models/subscriptionPackage';
import { SUBSCRIPTION_PACKAGES } from '@/utils/subscriptionPackages';

// Initialize/seed subscription packages
export async function POST() {
  try {
    await connectDB();

    // Clear existing packages (optional - remove in production)
    // await SubscriptionPackage.deleteMany({});

    // Create packages if they don't exist
    for (const pkg of SUBSCRIPTION_PACKAGES) {
      await SubscriptionPackage.findOneAndUpdate(
        { name: pkg.name },
        pkg,
        { upsert: true, new: true }
      );
    }

    const packages = await SubscriptionPackage.find({ isActive: true }).sort({ sortOrder: 1 });

    return NextResponse.json({
      success: true,
      message: 'Subscription packages initialized',
      packages
    });
  } catch (error) {
    console.error('Error initializing packages:', error);
    return NextResponse.json(
      { error: 'Failed to initialize packages' },
      { status: 500 }
    );
  }
}

// Get all active subscription packages
export async function GET() {
  try {
    await connectDB();

    const packages = await SubscriptionPackage.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    // If no packages exist, create them
    if (packages.length === 0) {
      for (const pkg of SUBSCRIPTION_PACKAGES) {
        await SubscriptionPackage.create(pkg);
      }
      
      const newPackages = await SubscriptionPackage.find({ isActive: true })
        .sort({ sortOrder: 1 })
        .lean();
      
      return NextResponse.json({ packages: newPackages });
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
