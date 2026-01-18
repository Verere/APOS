"use client"

import { GlobalContext } from "@/context"
import { CartContext } from "@/context/CartContext"
import { useContext, useRef } from "react"
import { currencyFormat } from '@/utils/currency'
import { useReactToPrint } from 'react-to-print';

const PrintPage = ({ cart, payments }) => {
  const { order } = useContext(CartContext)
  const { store, cartValue, payment, bal } = useContext(GlobalContext)

  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ 
    contentRef,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `
  });

  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <>
      <div ref={contentRef} style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '5mm' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
            {store?.name || 'STORE NAME'}
          </h2>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>
            {store?.address || 'Store Address'}
          </p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>
            {store?.number && `Tel: ${store.number}`}
            {store?.number && store?.whatsapp && ' | '}
            {store?.whatsapp && `WhatsApp: ${store.whatsapp}`}
          </p>
          {store?.email && (
            <p style={{ margin: '2px 0', fontSize: '11px' }}>{store.email}</p>
          )}
          <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: '10px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{order?.bDate || currentDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Receipt #:</span>
            <span>{order?.orderNum || 'N/A'}</span>
          </div>
          {order?.soldBy && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cashier:</span>
              <span>{order.soldBy}</span>
            </div>
          )}
          <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '4px 0' }}>ITEM</th>
                <th style={{ textAlign: 'center', padding: '4px 0' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '4px 0' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {cart?.map((item, index) => (
                <tr key={item?._id || index} style={{ borderBottom: '1px dotted #ccc' }}>
                  <td style={{ padding: '4px 0', wordBreak: 'break-word', maxWidth: '40mm' }}>
                    {item?.item || item?.name}
                  </td>
                  <td style={{ textAlign: 'center', padding: '4px 0' }}>{item?.qty}</td>
                  <td style={{ textAlign: 'right', padding: '4px 0' }}>
                    {currencyFormat(item?.amount || (item?.price * item?.qty))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '2px solid #000', margin: '8px 0' }}></div>
        </div>

        {/* Totals */}
        <div style={{ fontSize: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', padding: '4px 0' }}>
            <span>TOTAL:</span>
            <span>{currencyFormat(cartValue || order?.amount)}</span>
          </div>
          
          {/* Payment Details */}
          {payments && payments.length > 0 && (
            <>
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
              {payments.map((p, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{p.mop}:</span>
                  <span>{currencyFormat(p.amount)}</span>
                </div>
              ))}
            </>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold' }}>
            <span>PAID:</span>
            <span>{currencyFormat(payment || order?.amountPaid)}</span>
          </div>
          
          {(bal > 0 || order?.bal > 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>BALANCE:</span>
              <span>{currencyFormat(bal || order?.bal)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }}></div>
        <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Thank You!</p>
          <p style={{ margin: '5px 0', fontSize: '10px' }}>Please come again</p>
          <p style={{ margin: '5px 0', fontSize: '11px', fontWeight: 'bold' }}>Thank you for your patronage</p>
          <p style={{ margin: '5px 0', fontSize: '10px', color: '#888' }}>Powered by www.marketbook.app</p>
          {store?.whatsapp && (
            <p style={{ margin: '5px 0', fontSize: '10px' }}>
              Questions? WhatsApp: {store.whatsapp}
            </p>
          )}
        </div>
      </div>

      <button 
        onClick={reactToPrintFn} 
        className='bg-black text-white px-4 py-2 rounded-lg uppercase mt-4 w-full hover:bg-gray-800'>
        Print Receipt
      </button>
    </>
  )
}

export default PrintPage