import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import api from '../api';
import { Notice, PageHeading } from '../components/Notice';
import { setUser } from '../features/authSlice';

const demoAccounts = [
  { role: 'Buyer', email: 'buyer@example.com', detail: 'Browse, cart, checkout' },
  { role: 'Seller', email: 'seller@example.com', detail: 'Manage products and orders' },
  { role: 'Admin', email: 'admin@example.com', detail: 'Approve sellers, view metrics' }
];

export default function HomePage() {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMessage, setProfileMessage] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    if (!user) return;
    api.get('/dashboard').then(({ data }) => setDashboard(data)).catch((reason) => setError(reason.response?.data?.message || 'Dashboard could not load'));
  }, [user]);

  useEffect(() => setProfileName(user?.name || ''), [user?.name]);

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const { data } = await api.patch('/auth/me', { name: profileName });
      dispatch(setUser(data.user));
      setProfileMessage('Profile name updated.');
    } catch (reason) {
      setProfileMessage(reason.response?.data?.message || 'Profile could not be updated.');
    }
  }

  if (!user) return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> MARKETPLACE, MADE VISIBLE</p>
          <h1>See how the pieces<br />of commerce <em>connect.</em></h1>
          <p className="hero-text">A hands-on learning lab for the flows behind a marketplace. Switch roles, make a purchase, and watch what happens at every step.</p>
          <div className="hero-actions">
            <Link to="/login" className="button button-dark">Start exploring <span aria-hidden="true">→</span></Link>
            <span className="hero-hint">Seeded demo accounts included</span>
          </div>
          <div className="hero-proof"><span className="proof-avatars">B&nbsp; S&nbsp; A</span> One app. Three perspectives.</div>
        </div>
        <div className="hero-art" aria-label="Illustration of the marketplace order flow">
          <div className="art-glow" />
          <div className="art-card art-card-back">
            <span className="art-label">ORDER #ERA-1024</span>
            <div className="art-order-line"><span className="art-order-icon">✓</span><span>Payment confirmed</span><b>₹74.25</b></div>
            <div className="art-track"><i /><i /><i /></div>
            <div className="art-caption">Order is on its way</div>
          </div>
          <div className="art-product">
            <div className="art-plant"><span /><i /><b /></div>
            <div className="art-product-meta"><span>SELLER PICK</span><b>Desk Plant Starter</b><small>Home &nbsp;·&nbsp; 12 in stock</small></div>
          </div>
          <div className="art-chip"><span className="chip-check">↗</span> Seller dashboard <b>+4 orders</b></div>
          <div className="art-stamp">LEARN<br />BY DOING</div>
        </div>
      </section>
      <section className="flow-strip">
        <div><span className="step-num">01</span><span><b>Shop</b><small>Find a product</small></span></div>
        <span className="flow-arrow">→</span>
        <div><span className="step-num">02</span><span><b>Checkout</b><small>Reserve inventory</small></span></div>
        <span className="flow-arrow">→</span>
        <div><span className="step-num">03</span><span><b>Fulfill</b><small>Track the order</small></span></div>
        <span className="flow-arrow">→</span>
        <div><span className="step-num">04</span><span><b>Understand</b><small>See both sides</small></span></div>
      </section>
      <section className="demo-section">
        <div className="section-intro"><p className="eyebrow">YOUR SANDBOX</p><h2>Three roles.<br />One connected story.</h2><p>Sign in as any role and experience the marketplace from that seat.</p></div>
        <div className="role-cards">
          {demoAccounts.map((account) => <div className="role-card" key={account.role}>
            <span className="role-icon">{account.role.slice(0, 1)}</span>
            <div><b>{account.role}</b><small>{account.detail}</small><code>{account.email}</code></div>
            <span className="role-arrow">↗</span>
          </div>)}
          <p className="role-password">Password for each account: <code>Demo123!</code></p>
        </div>
      </section>
      <section className="disclaimer-band"><span className="shield">i</span><p><b>A safe place to learn.</b> Payments use Razorpay Test Mode when configured, otherwise a local simulator. No real money is moved.</p></section>
    </div>
  );

  return (
    <div className="dashboard-page">
      <PageHeading eyebrow={`YOUR ${user.role.toUpperCase()} WORKSPACE`} title={`Good to see you, ${user.name.split(' ')[0]}.`} description="Here is the latest from your marketplace workspace." />
      {error && <Notice tone="error">{error}</Notice>}
      {user.role === 'seller' && user.sellerStatus === 'pending' && <Notice>Your seller application is waiting for admin approval. You can explore the shop while you wait.</Notice>}
      {dashboard && <MetricGrid metrics={dashboard.metrics} role={user.role} />}
      <div className="dashboard-bottom">
        <div className="panel learn-panel">
          <p className="eyebrow">LEARNING PATH</p><h2>Take a flow for a spin</h2>
          <div className="learn-steps">
            <Link to="/shop"><span>01</span><div><b>Browse the catalog</b><small>Search, filter, and add an item to your cart.</small></div><i>→</i></Link>
            <Link to={user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/orders'}><span>02</span><div><b>See the other side</b><small>Orders and dashboards follow the same state.</small></div><i>→</i></Link>
          </div>
        </div>
        <div className="panel roles-panel"><p className="eyebrow">CURRENT ROLE</p><div className="role-badge">{user.role}</div><h3>{user.role === 'seller' ? 'Your shop, your orders.' : user.role === 'admin' ? 'Keep the marketplace moving.' : 'The buyer journey starts here.'}</h3><p>Switch accounts with Sign out to explore a different view.</p>
          <form className="profile-form" onSubmit={saveProfile}><label>Profile name<input value={profileName} maxLength={80} onChange={(event) => setProfileName(event.target.value)} required /></label><button className="button button-outline button-small">Save profile</button>{profileMessage && <small>{profileMessage}</small>}</form>
        </div>
      </div>
    </div>
  );
}

function MetricGrid({ metrics, role }) {
  const entries = role === 'admin'
    ? [['Total users', metrics.users, 'Across all roles'], ['Active products', metrics.products, 'Visible in the catalog'], ['Orders', metrics.orders, 'All marketplace orders'], ['Paid volume', money(metrics.paidRevenue), `${metrics.pendingSellers} sellers awaiting approval`]]
    : role === 'seller'
      ? [['Products', metrics.products, 'Your active catalog'], ['Orders', metrics.orders, 'Containing your products'], ['Low stock', metrics.lowStock, 'Five units or fewer'], ['Paid sales', money(metrics.paidRevenue), 'Item value in paid orders']]
      : [['Your orders', metrics.orders, 'Placed from this account']];
  return <div className={`metric-grid metric-grid-${entries.length}`}>{entries.map(([label, value, note]) => <div className="metric-card" key={label}><span>{label}</span><b>{value}</b><small>{note}</small></div>)}</div>;
}

export const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amount) || 0);
