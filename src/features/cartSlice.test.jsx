import { beforeEach, describe, expect, it } from 'vitest';
import reducer, { addItem, clearCart, setQuantity } from './cartSlice';

describe('cart state', () => {
  beforeEach(() => localStorage.clear());

  it('merges repeated items, caps quantities to available stock, and persists the cart', () => {
    const product = { _id: 'p-1', name: 'Demo item', price: 12, stock: 2 };
    let state = reducer(undefined, addItem(product));
    state = reducer(state, addItem(product));
    state = reducer(state, addItem(product));
    expect(state.items[0].quantity).toBe(2);
    state = reducer(state, setQuantity({ id: 'p-1', quantity: 8 }));
    expect(state.items[0].quantity).toBe(2);
    expect(JSON.parse(localStorage.getItem('eraCart'))[0].quantity).toBe(2);
  });

  it('clears persisted items after checkout', () => {
    const state = reducer({ items: [{ _id: 'p-1', quantity: 1 }] }, clearCart());
    expect(state.items).toEqual([]);
    expect(localStorage.getItem('eraCart')).toBeNull();
  });
});
