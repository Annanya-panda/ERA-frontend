import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, removeItem, setQuantity } from '../features/cartSlice';
import api from '../api';
import { money } from './HomePage';
import { Notice, PageHeading } from '../components/Notice';

export default function CartPage() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [address, setAddress] = useState({ name: '', line1: '', city: '', postalCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discount = couponCode.trim().toUpperCase() === 'LEARN10' ? Math.round(subtotal * 0.1 * 100) / 100 : 0;

  async function checkout(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
        couponCode,
        shippingAddress: address
      });
      dispatch(clearCart());
      navigate('/orders', { state: { createdOrderId: data.order._id } });
    } catch (reason) {
      setError(reason.response?.data?.message || 'Checkout failed. Review your cart and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) return (
    <div className="cart-page">
      <PageHeading eyebrow="YOUR CART" title="Your next great find awaits." description="Add a product to see how checkout reserves inventory and creates an order." />
      <div className="empty-state empty-cart"><span>＋</span><h2>Your cart is ready</h2><p>Start with a product from the demo marketplace.</p><Link className="button button-dark" to="/shop">Explore the shop →</Link></div>
    </div>
  );

  return (
    <div className="cart-page">
      <PageHeading eyebrow="CHECKOUT FLOW" title="A few details, then you're set." description="The API recalculates totals and reserves stock when you place the order." />
      <Notice tone="error">{error}</Notice>
      <div className="checkout-layout">
        <form className="panel checkout-form" onSubmit={checkout}>
          <div className="form-section-title"><span>01</span><div><h2>Delivery details</h2><p>Demo data only. No address is sent to a shipping provider.</p></div></div>
          <div className="form-grid">
            <label className="full">Recipient name<input required value={address.name} onChange={(event) => setAddress({ ...address, name: event.target.value })} /></label>
            <label className="full">Street address<input required value={address.line1} onChange={(event) => setAddress({ ...address, line1: event.target.value })} /></label>
            <label>City<input required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} /></label>
            <label>Postal code<input required value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} /></label>
          </div>
          <div className="form-section-title coupon-title"><span>02</span><div><h2>Got a learning coupon?</h2><p>Try <code>LEARN10</code> for 10% off.</p></div></div>
          <label className="coupon-input"><span className="sr-only">Coupon code</span><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter coupon code" /><span>{discount ? 'Applied ✓' : couponCode ? 'Not recognized' : 'Optional'}</span></label>
          <button className="button button-dark button-wide checkout-submit" disabled={busy}>{busy ? 'Placing order…' : 'Place demo order'} <span>→</span></button>
          <p className="secure-note">🔒 Checkout creates an unpaid order and reserves the listed quantities. Payment happens in the next step.</p>
        </form>
        <aside className="panel order-summary">
          <p className="eyebrow">ORDER SUMMARY</p>
          <h2>{items.length} {items.length === 1 ? 'item' : 'items'}</h2>
          <div className="summary-items">{items.map((item) => <div className="summary-item" key={item._id}>
            <div className="summary-thumb">{item.imageUrl && <img src={item.imageUrl} alt="" />}</div>
            <div><b>{item.name}</b><small>{money(item.price)} each</small>
              <div className="quantity-control"><button aria-label={`Decrease ${item.name} quantity`} onClick={() => dispatch(setQuantity({ id: item._id, quantity: item.quantity - 1 }))}>−</button><span>{item.quantity}</span><button aria-label={`Increase ${item.name} quantity`} onClick={() => dispatch(setQuantity({ id: item._id, quantity: item.quantity + 1 }))}>+</button><button className="remove-item" onClick={() => dispatch(removeItem(item._id))}>Remove</button></div>
            </div><strong>{money(item.price * item.quantity)}</strong>
          </div>)}</div>
          <div className="summary-total"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div className="summary-total discount-line"><span>Learning coupon</span><b>− {money(discount)}</b></div>
          <div className="summary-total total-line"><span>Total</span><b>{money(subtotal - discount)}</b></div>
          <div className="summary-foot">Taxes and shipping are intentionally omitted from this teaching demo.</div>
        </aside>
      </div>
    </div>
  );
}
