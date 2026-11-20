import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('eraCart') || '[]');
  } catch {
    return [];
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addItem(state, action) {
      const item = action.payload;
      const existing = state.items.find((line) => line._id === item._id);
      if (existing) existing.quantity = Math.min(existing.quantity + 1, item.stock);
      else state.items.push({ ...item, quantity: 1 });
      localStorage.setItem('eraCart', JSON.stringify(state.items));
    },
    setQuantity(state, action) {
      const line = state.items.find((item) => item._id === action.payload.id);
      if (line) line.quantity = Math.max(1, Math.min(Number(action.payload.quantity) || 1, line.stock));
      localStorage.setItem('eraCart', JSON.stringify(state.items));
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem('eraCart', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('eraCart');
    }
  }
});

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
