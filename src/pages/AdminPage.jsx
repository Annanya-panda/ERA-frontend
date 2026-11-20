import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { Notice, PageHeading } from '../components/Notice';

export default function AdminPage() {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const refresh = useCallback(() => api.get('/admin/sellers').then(({ data }) => setSellers(data.sellers)).catch((reason) => setError(reason.response?.data?.message || 'Could not load seller applications')), []);
  useEffect(() => { refresh(); }, [refresh]);

  async function setStatus(seller, status) {
    setError('');
    setMessage('');
    try {
      await api.patch(`/admin/sellers/${seller._id}`, { status });
      setMessage(`${seller.name} is now ${status}.`);
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Seller status could not be updated');
    }
  }

  return (
    <div className="admin-page">
      <PageHeading eyebrow="ADMIN DESK" title="A clear view of the marketplace." description="Review seller applications and keep the demo marketplace in good shape." />
      {error && <Notice tone="error">{error}</Notice>}
      {message && <Notice tone="success">{message}</Notice>}
      <section className="panel admin-seller-panel">
        <div className="panel-heading"><div><p className="eyebrow">SELLER ONBOARDING</p><h2>Applications <span className="count-badge">{sellers.filter((seller) => seller.sellerStatus === 'pending').length} pending</span></h2></div></div>
        {!sellers.length && <div className="inline-empty">New seller accounts will appear here. Register as a seller to see the approval flow.</div>}
        <div className="seller-app-list">{sellers.map((seller) => <div className="seller-application" key={seller._id}>
          <span className="seller-avatar">{seller.name.slice(0, 1).toUpperCase()}</span>
          <div className="seller-app-info"><b>{seller.name}</b><small>{seller.email} · Applied {new Date(seller.createdAt).toLocaleDateString()}</small></div>
          <span className={`status-pill status-${seller.sellerStatus}`}>{seller.sellerStatus}</span>
          {seller.sellerStatus === 'pending' && <div className="approval-actions"><button className="button button-dark button-small" onClick={() => setStatus(seller, 'approved')}>Approve</button><button className="button button-outline button-small" onClick={() => setStatus(seller, 'rejected')}>Decline</button></div>}
        </div>)}</div>
      </section>
      <div className="admin-learning-note"><span>i</span><p><b>Why seller approval?</b> New sellers receive a pending profile at signup. Server-side role checks keep product publishing unavailable until an admin approves them.</p></div>
    </div>
  );
}
