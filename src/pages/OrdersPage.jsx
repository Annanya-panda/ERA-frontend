import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../api';
import { money } from './HomePage';
import { Notice, PageHeading } from '../components/Notice';

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OrdersPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState({ razorpayEnabled: false });
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const location = useLocation();

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/mine');
      setOrders(data.orders);
      setError('');
    } catch (reason) {
      setError(reason.response?.data?.message || 'Could not load orders');
    }
  }, []);

  useEffect(() => {
    refresh();
    api.get('/config').then(({ data }) => setConfig(data)).catch(() => setConfig({ razorpayEnabled: false }));
    const base = (import.meta.env.VITE_API_URL || `${window.location.origin}/api`).replace(/\/api\/?$/, '');
    const socket = io(base, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('order:update', refresh);
    return () => socket.disconnect();
  }, [refresh, token]);

  async function simulate(order, outcome) {
    setBusyId(order._id);
    setError('');
    try {
      await api.post(`/orders/${order._id}/payments/simulate`, { outcome });
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Payment simulation failed');
    } finally {
      setBusyId('');
    }
  }

  async function payWithRazorpay(order) {
    setBusyId(order._id);
    setError('');
    try {
      const { data } = await api.post(`/orders/${order._id}/payments/razorpay-order`);
      if (!(await loadRazorpay())) throw new Error('Razorpay Checkout could not be loaded. Check your connection and try again.');
      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'ERA Marketplace Lab',
        description: `Demo order ${order._id.slice(-6)}`,
        order_id: data.razorpayOrder.id,
        handler: async (response) => {
          try {
            await api.post(`/orders/${order._id}/payments/verify`, response);
            await refresh();
          } catch (reason) {
            setError(reason.response?.data?.message || 'Payment verification failed');
          } finally {
            setBusyId('');
          }
        },
        modal: { ondismiss: () => setBusyId('') },
        theme: { color: '#0f766e' }
      });
      checkout.open();
    } catch (reason) {
      setError(reason.response?.data?.message || reason.message || 'Could not start test checkout');
      setBusyId('');
    }
  }

  async function cancelOrder(orderId) {
    setBusyId(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Order could not be cancelled');
    } finally {
      setBusyId('');
    }
  }

  async function simulateRefund(order) {
    if (!window.confirm(`Record a simulated refund for order ${order._id.slice(-8)}? No payment provider will return funds.`)) return;
    setBusyId(order._id);
    try {
      await api.post(`/orders/${order._id}/refund/simulate`);
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Demo refund could not be recorded');
    } finally {
      setBusyId('');
    }
  }

  async function updateStatus(order, status) {
    setBusyId(order._id);
    const trackingNumber = status === 'shipped' ? window.prompt('Enter a demo tracking number:') : '';
    if (status === 'shipped' && !trackingNumber) {
      setBusyId('');
      return;
    }
    try {
      await api.patch(`/orders/${order._id}/status`, { status, trackingNumber });
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Order could not be updated');
    } finally {
      setBusyId('');
    }
  }

  const orderCreated = orders.find((order) => order._id === location.state?.createdOrderId);
  return (
    <div className="orders-page">
      <PageHeading eyebrow={user.role === 'buyer' ? 'YOUR PURCHASES' : 'FULFILLMENT'} title={user.role === 'buyer' ? 'Orders, at a glance.' : 'Orders in motion.'} description={user.role === 'buyer' ? 'Pay, track, or cancel eligible demo orders.' : 'Move orders through fulfillment and add tracking as they ship.'} />
      {error && <Notice tone="error">{error}</Notice>}
      {orderCreated && <Notice>Your order is created. Stock has been reserved; choose a payment option below to continue.</Notice>}
      {orders.length === 0 && <div className="empty-state"><span>↗</span><h2>No orders here yet</h2><p>{user.role === 'buyer' ? 'Try the learning path: browse a product, add it to your cart, and check out.' : 'Orders containing your products will show up here.'}</p></div>}
      <div className="orders-list">
        {orders.map((order) => <article className="order-card" key={order._id}>
          <div className="order-card-top">
            <div><p className="eyebrow">ORDER #{order._id.slice(-8).toUpperCase()}</p><h2>{order.items.map((item) => item.name).join(', ')}</h2><span className="order-date">{new Date(order.createdAt).toLocaleString()}</span></div>
            <span className={`status-pill status-${order.status}`}>{order.status.replaceAll('_', ' ')}</span>
          </div>
          <div className="order-progress">{['payment_pending', 'paid', 'processing', 'shipped', 'delivered'].map((step) => <span className={order.status === step ? 'current' : order.timeline?.some((entry) => entry.status === step) ? 'done' : ''} key={step}>{step.replaceAll('_', ' ')}</span>)}</div>
          <div className="order-card-bottom">
            <div className="order-items">{order.items.map((item) => <span key={item._id || item.product}>{item.quantity} × {item.name}</span>)}<b>{money(order.total)}</b>
              {order.trackingNumber && <small>Demo tracking: {order.trackingNumber}</small>}
            </div>
            <div className="order-actions">
              {user.role === 'buyer' && ['payment_pending', 'payment_failed'].includes(order.status) && <>
                {config.razorpayEnabled
                  ? <button className="button button-dark button-small" disabled={busyId === order._id} onClick={() => payWithRazorpay(order)}>{busyId === order._id ? 'Opening…' : 'Pay with Razorpay Test'}</button>
                  : <div className="sim-actions"><button className="button button-dark button-small" disabled={busyId === order._id} onClick={() => simulate(order, 'success')}>Simulate success</button><button className="button button-outline button-small" disabled={busyId === order._id} onClick={() => simulate(order, 'failure')}>Try failure</button></div>}
                {!order.razorpayOrderId && <button className="text-button" disabled={busyId === order._id} onClick={() => cancelOrder(order._id)}>Cancel order</button>}
              </>}
              {user.role !== 'buyer' && ({
                paid: <button className="button button-dark button-small" disabled={busyId === order._id} onClick={() => updateStatus(order, 'processing')}>Start processing</button>,
                processing: <button className="button button-dark button-small" disabled={busyId === order._id} onClick={() => updateStatus(order, 'shipped')}>Mark shipped</button>,
                shipped: <button className="button button-dark button-small" disabled={busyId === order._id} onClick={() => updateStatus(order, 'delivered')}>Mark delivered</button>
              }[order.status] || null)}
              {user.role === 'admin' && ['paid', 'processing'].includes(order.status) && order.paymentStatus === 'paid' &&
                <button className="button button-outline button-small" disabled={busyId === order._id} onClick={() => simulateRefund(order)}>Simulate refund</button>}
            </div>
          </div>
          {order.timeline?.length > 0 && <details className="timeline-details"><summary>See what happened</summary><ol>{order.timeline.map((event, index) => <li key={`${event.status}-${index}`}><b>{event.status.replaceAll('_', ' ')}</b><span>{event.note}</span><small>{new Date(event.at).toLocaleString()}</small></li>)}</ol></details>}
        </article>)}
      </div>
      <div className="flow-explainer"><span className="flow-explainer-icon">03</span><p><b>What happens next?</b> Payment confirmation changes the order state. A seller can then process, ship, and deliver it; Socket.IO sends live updates to the buyer.</p></div>
    </div>
  );
}
