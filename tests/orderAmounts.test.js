import test from 'node:test'
import assert from 'node:assert/strict'
import { getOrderTotal, getProductSalesAmount } from '../src/lib/orderAmounts.js'

test('new orders keep product revenue separate from delivery', () => {
  const order = { amount: 1000, totalAmount: 1250, deliveryCost: 250 }

  assert.equal(getProductSalesAmount(order), 1000)
  assert.equal(getOrderTotal(order), 1250)
})

test('legacy orders subtract delivery from revenue without changing the amount due', () => {
  const order = { amount: 1250, totalAmount: 1250, deliveryCost: 250 }

  assert.equal(getProductSalesAmount(order), 1000)
  assert.equal(getOrderTotal(order), 1250)
})

test('service charges remain separate from product revenue and are included in amount due', () => {
  const order = { amount: 1000, totalAmount: 1350, deliveryCost: 150, serviceChargeCost: 200 }

  assert.equal(getProductSalesAmount(order), 1000)
  assert.equal(getOrderTotal(order), 1350)
})

test('legacy orders subtract delivery and service charges from revenue', () => {
  const order = { amount: 1350, totalAmount: 1350, deliveryCost: 150, serviceChargeCost: 200 }

  assert.equal(getProductSalesAmount(order), 1000)
  assert.equal(getOrderTotal(order), 1350)
})

test('legacy orders subtract a service charge when there is no delivery fee', () => {
  const order = { amount: 1200, totalAmount: 1200, serviceChargeCost: 200 }

  assert.equal(getProductSalesAmount(order), 1000)
  assert.equal(getOrderTotal(order), 1200)
})

test('orders without delivery keep their amount unchanged', () => {
  const order = { amount: 1000, totalAmount: 1000 }

  assert.equal(getProductSalesAmount(order), 1000)
  assert.equal(getOrderTotal(order), 1000)
})
