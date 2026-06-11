import { beforeEach, describe, expect, it } from 'vitest';
import useCartStore from './cart.store';

const resetCart = () => {
  useCartStore.setState({
    cart: { items: [], subtotal: 0, discountTotal: 0, loyaltyDiscount: 0, total: 0 },
    paymentData: { method: 'cash', paidAmount: 0, changeAmount: 0, splitEnabled: false }
  });
};

describe('cart store', () => {
  beforeEach(() => {
    resetCart();
  });

  it('adds an item and recalculates totals', () => {
    useCartStore.getState().addItem({
      name: 'Pet Shampoo',
      itemType: 'product',
      referenceId: 'prod-1',
      unitPrice: 50000,
      quantity: 2,
      discountAmount: 0
    });

    const cart = useCartStore.getState().cart;

    expect(cart.items).toHaveLength(1);
    expect(cart.subtotal).toBe(100000);
    expect(cart.total).toBe(100000);
  });

  it('updates quantity and preserves totals', () => {
    useCartStore.getState().addItem({
      name: 'Pet Shampoo',
      itemType: 'product',
      referenceId: 'prod-1',
      unitPrice: 50000,
      quantity: 1,
      discountAmount: 0
    });

    const item = useCartStore.getState().cart.items[0];
    useCartStore.getState().updateQuantity(item.id, 3);

    expect(useCartStore.getState().cart.subtotal).toBe(150000);
    expect(useCartStore.getState().cart.items[0].quantity).toBe(3);
  });

  it('applies discounts and loyalty redemption', () => {
    const store = useCartStore.getState();

    store.addItem({
      name: 'Consultation',
      itemType: 'service',
      referenceId: 'svc-1',
      unitPrice: 200000,
      quantity: 1,
      discountAmount: 10000
    });

    store.setCustomer('cust-1', 'Jane Doe', 500);
    store.setLoyaltyRedeem(100);

    const cart = useCartStore.getState().cart;

    expect(cart.discountTotal).toBe(10000);
    expect(cart.loyaltyPointsToRedeem).toBe(100);
    expect(cart.loyaltyDiscount).toBe(100 * 100);
    expect(cart.total).toBe(200000 - 10000 - 10000);
  });

  it('calculates change for cash payment', () => {
    const store = useCartStore.getState();

    store.addItem({
      name: 'Pet Food',
      itemType: 'product',
      referenceId: 'prod-2',
      unitPrice: 30000,
      quantity: 2,
      discountAmount: 0
    });

    useCartStore.getState().setPaidAmount(70000);
    const updatedState = useCartStore.getState();

    expect(updatedState.paymentData.changeAmount).toBe(10000);
  });
});
