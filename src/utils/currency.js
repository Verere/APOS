export function currencyFormat(num) {
   return '₦' + num?.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export function percentDiscount(price1, price2) {
   const discount = (((price2-price1)/price2)*100)?.toFixed(0)

   return discount

}