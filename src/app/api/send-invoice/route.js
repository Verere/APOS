import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { sendEmail } from '@/utils/email'
import { currencyFormat } from '@/utils/currency'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceData, storeInfo, customerEmail } = await req.json()

    if (!customerEmail || !invoiceData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
          .container { max-width: 800px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2563eb; font-size: 28px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .credit-notice { background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; text-align: center; border-radius: 6px; }
          .credit-notice p { color: #856404; font-weight: bold; font-size: 18px; margin: 0; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #2563eb; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item { font-size: 14px; }
          .info-label { font-weight: bold; color: #555; }
          .info-value { color: #333; margin-left: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; color: #374151; font-weight: bold; font-size: 14px; }
          td { font-size: 14px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row { background-color: #f9fafb; font-weight: bold; font-size: 15px; }
          .balance-row { background-color: #fff3cd; font-weight: bold; font-size: 16px; }
          .balance-row td { color: #dc2626; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; }
          .footer p { margin: 5px 0; font-size: 14px; }
          @media only screen and (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${storeInfo?.name || 'Store Name'}</h1>
            <p>${storeInfo?.address || ''}</p>
            <p>Tel: ${storeInfo?.number || ''} | Email: ${storeInfo?.email || ''}</p>
          </div>

          <div class="credit-notice">
            <p>CREDIT SALE INVOICE</p>
          </div>

          <div class="section">
            <h2>Order Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Invoice #:</span>
                <span class="info-value">${invoiceData.orderNum}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Customer Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name:</span>
                <span class="info-value">${invoiceData.customer?.name || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone:</span>
                <span class="info-value">${invoiceData.customer?.phone || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${invoiceData.customer?.email || ''}</span>
              </div>
              ${invoiceData.customer?.address ? `
              <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">Address:</span>
                <span class="info-value">${[
                  invoiceData.customer.address.street,
                  invoiceData.customer.address.city,
                  invoiceData.customer.address.state,
                  invoiceData.customer.address.zipCode
                ].filter(Boolean).join(', ')}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <h2>Items Ordered</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Price</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items?.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${currencyFormat(item.price)}</td>
                    <td class="text-center">${item.qty}</td>
                    <td class="text-right">${currencyFormat(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" class="text-right">TOTAL AMOUNT:</td>
                  <td class="text-right">${currencyFormat(invoiceData.totalAmount)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="text-right">AMOUNT PAID:</td>
                  <td class="text-right">${currencyFormat(0)}</td>
                </tr>
                <tr class="balance-row">
                  <td colspan="3" class="text-right">BALANCE DUE:</td>
                  <td class="text-right">${currencyFormat(invoiceData.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            <p style="font-size: 12px; color: #999;">If you have any questions, please contact us at ${storeInfo?.email || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email
    await sendEmail({
      to: customerEmail,
      subject: `Credit Sale Invoice - ${invoiceData.orderNum}`,
      html: emailHTML,
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
    })

  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
