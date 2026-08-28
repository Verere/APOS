import {  fetchSlug, fetchProducts, fetchCustomers } from '@/actions/fetch';

import PosPage from '@/components/Pos';
import connectDB from '@/utils/connectDB';
import StoreSettings from '@/models/storeSettings';
import Store from '@/models/store';
import User from '@/models/user';
import UserSubscription from '@/models/userSubscription';
import { isDatabaseConnectivityError } from '@/lib/dbError';


const Pos = async({params, searchParams})=>{
    try{
        const {slug} = await params
        const fallbackHotel = [{
          slug,
          name: slug,
          address: '',
          number: '',
          email: '',
        }]

        let serverUnavailable = false
        let serverErrorMessage = ''
        let getHotel = fallbackHotel
        let menus = []
        let customers = []
        let settings = {
          allowCreditSales: false,
          allowPriceAdjustment: false,
          allowPriceTypeSelection: false,
          allowDecimalQuantity: false,
          priceTypes: [],
          defaultPriceTypeId: null,
          receiptFormat: 'standard',
          printerName: '',
          receiptSpecialNote: '',
        }

        try {
          getHotel = await fetchSlug(slug)

          await connectDB()
          const store = await Store.findOne({ slug }).lean()

          if (!store) {
            return (
              <div className="p-4 text-red-600">Store not found</div>
            )
          }

          // Fetch or create store settings
          let dbSettings = await StoreSettings.findOne({ slug }).lean()
          if (!dbSettings && store) {
            dbSettings = await StoreSettings.create({
              storeId: store._id,
              slug: slug,
              allowCreditSales: true,
              allowPriceAdjustment: false,
              allowPriceTypeSelection: false,
              allowDecimalQuantity: false,
              priceTypes: [],
              defaultPriceTypeId: null,
              receiptSpecialNote: ''
            })
            dbSettings = dbSettings.toObject()
          }

          settings = {
            ...settings,
            ...dbSettings,
          }

          menus = await fetchProducts(slug)
          customers = await fetchCustomers(slug)
        } catch (innerErr) {
          if (isDatabaseConnectivityError(innerErr)) {
            serverUnavailable = true
            serverErrorMessage = 'Server is currently unreachable. POS is running in local-first mode and will sync when internet/server is back.'
            getHotel = Array.isArray(getHotel) && getHotel.length ? getHotel : fallbackHotel
            menus = []
            customers = []
          } else {
            throw innerErr
          }
        }

        return(
            <>
             <PosPage
                 menus={menus}
                 getHotel={getHotel}
                 slug={slug}
                 customers={customers}
                 serverUnavailable={serverUnavailable}
                 serverErrorMessage={serverErrorMessage}
               pricingSettings={{
                 priceTypes: Array.isArray(settings?.priceTypes) ? settings.priceTypes : [],
                 defaultPriceTypeId: settings?.defaultPriceTypeId ?? null,
               }}
               printingSettings={{
                 receiptFormat: settings?.receiptFormat || 'standard',
                 printerName: settings?.printerName || '',
                 receiptSpecialNote: settings?.receiptSpecialNote || '',
                 showWalletBalanceOnReceipt: settings?.showWalletBalanceOnReceipt ?? false,
                 showOutstandingBalanceOnReceipt: settings?.showOutstandingBalanceOnReceipt ?? false,
               }}
                 allowCreditSales={serverUnavailable ? false : (settings?.allowCreditSales ?? true)}
                 allowPriceAdjustment={settings?.allowPriceAdjustment ?? false}
                 allowPriceTypeSelection={settings?.allowPriceTypeSelection ?? false}
                 allowDecimalQuantity={settings?.allowDecimalQuantity ?? false}
                 allowComplimentarySale={serverUnavailable ? false : (settings?.allowComplimentarySale ?? false)}
             />
            </>
        )
    }catch(err){
        console.error('Pos page data fetch error:', err)
        return (<div className="p-4 text-red-600">Error loading POS page: {String(err?.message || err)}</div>)
    }
}
export default Pos;