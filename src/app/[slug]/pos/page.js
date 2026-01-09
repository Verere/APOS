import { FetchCategory, fetchOneOrder, fetchSearchedProducts, fetchSalesByOrderId, fetchBDate, fetchPaymentByOrder, fetchSlug, fetchAllOrders, fetchCategory, fetchProducts, fetchCustomers } from '@/actions/fetch';
import { updatePassword } from '@/actions/update';
import PosPage from '@/components/Pos';
import connectDB from '@/utils/connectDB';
import StoreSettings from '@/models/storeSettings';
import Store from '@/models/store';
import User from '@/models/user';
import UserSubscription from '@/models/userSubscription';


const Pos = async({params, searchParams})=>{
    try{
        const {slug} = await params
        const getHotel = await fetchSlug(slug)

        await connectDB()
        const store = await Store.findOne({ slug }).lean()
        
        if (!store) {
          return (
            <div className="p-4 text-red-600">Store not found</div>
          )
        }

        // Dynamically find the store owner using StoreMembership
        const StoreMembership = (await import('@/models/storeMembership')).default;
        const ownerMembership = await StoreMembership.findOne({
          storeId: store._id,
          role: 'OWNER',
          isDeleted: { $ne: true }
        }).lean();

        const ownerId = ownerMembership?.userId?.toString() || store.user?.toString();
        const owner = await User.findById(ownerId).populate('currentSubscription');
        // Also check subscriptions directly
        const directSubscription = await UserSubscription.findOne({
          userId: ownerId,
          status: { $in: ['ACTIVE', 'TRIAL'] }
        }).sort({ createdAt: -1 });

        console.log('POS subscription check:', {
          storeOwner: ownerId,
          ownerFound: !!owner,
          hasCurrentSubscription: !!owner?.currentSubscription,
          currentSubscriptionId: owner?.currentSubscription?._id?.toString(),
          subscriptionStatus: owner?.currentSubscription?.status,
          directSubscriptionFound: !!directSubscription,
          directSubscriptionStatus: directSubscription?.status,
          allUserSubscriptions: await UserSubscription.find({ userId: ownerId }).select('status packageName createdAt').lean()
        });

        const hasActiveSubscription = (owner?.currentSubscription &&
          ['ACTIVE', 'TRIAL'].includes(owner.currentSubscription.status)) ||
          directSubscription;

        console.log('Has active subscription:', hasActiveSubscription);

        if (!hasActiveSubscription) {
          const subscriptionStatus = owner?.currentSubscription?.status || directSubscription?.status || 'NONE';
          const message = subscriptionStatus === 'EXPIRED'
            ? 'Subscription Expired'
            : 'No Active Subscription';

          console.log('Blocking access - Status:', subscriptionStatus);

          return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{message}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The store owner's subscription has {subscriptionStatus === 'EXPIRED' ? 'expired' : 'not been activated'}.
                  Please contact the store owner to renew the subscription.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  Store: <span className="font-semibold">{slug}</span>
                </div>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </a>
              </div>
            </div>
          );
        }
        
        // Fetch or create store settings
        let settings = await StoreSettings.findOne({ slug }).lean()
        if (!settings && store) {
          // Create default settings if none exist
          settings = await StoreSettings.create({
            storeId: store._id,
            slug: slug,
            allowCreditSales: true,
            allowPriceAdjustment: false
          })
          settings = settings.toObject()
        }
  
        const menus = await fetchProducts(slug)
        const customers = await fetchCustomers(slug)

        return(
            <>            
             <PosPage 
                 menus={menus} 
                 getHotel={getHotel}
                 slug={slug}
                 customers={customers}
                 allowCreditSales={settings?.allowCreditSales ?? true}
                 allowPriceAdjustment={settings?.allowPriceAdjustment ?? false}
             />
            </>
        )
    }catch(err){
        console.error('Pos page data fetch error:', err)
        return (<div className="p-4 text-red-600">Error loading POS page: {String(err?.message || err)}</div>)
    }
}
export default Pos;