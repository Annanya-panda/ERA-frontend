import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api';
import { money } from './HomePage';
import { Notice, PageHeading } from '../components/Notice';

const initialProduct = { name: '', description: '', category: 'Home', price: '', stock: '', imageUrl: '' };

export default function SellerPage() {
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialProduct);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState('');

  const refresh = useCallback(() => api.get('/products/mine').then(({ data }) => setProducts(data.products)).catch((reason) => setError(reason.response?.data?.message || 'Could not load products')), []);
  useEffect(() => { if (user.sellerStatus === 'approved') refresh(); }, [refresh, user.sellerStatus]);

  async function createProduct(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) await api.patch(`/products/${editingId}`, payload);
      else await api.post('/products', payload);
      setForm(initialProduct);
      setEditingId('');
      setMessage(editingId ? 'Product changes saved.' : 'Product added to your catalog.');
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Product could not be saved');
    } finally {
      setBusy(false);
    }
  }

  function editProduct(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || ''
    });
    document.getElementById('product-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    setBusy(true);
    setError('');
    try {
      const { data: result } = await api.post('/products/image', data);
      setForm((current) => ({ ...current, imageUrl: result.imageUrl }));
      setMessage('Image uploaded to Cloudinary.');
    } catch (reason) {
      setError(reason.response?.data?.message || 'Image upload failed');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function updateStock(product, amount) {
    try {
      await api.patch(`/products/${product._id}`, { stock: Math.max(0, product.stock + amount) });
      await refresh();
    } catch (reason) {
      setError(reason.response?.data?.message || 'Stock could not be changed');
    }
  }

  async function archive(product) {
    if (!window.confirm(`Archive ${product.name}? It will no longer appear in the shop.`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((current) => current.filter((item) => item._id !== product._id));
    } catch (reason) {
      setError(reason.response?.data?.message || 'Product could not be archived');
    }
  }

  return (
    <div className="seller-page">
      <PageHeading eyebrow="SELLER STUDIO" title="Your shop, in motion." description="Manage the catalog and see how inventory connects to buyer orders." />
      {error && <Notice tone="error">{error}</Notice>}
      {message && <Notice tone="success">{message}</Notice>}
      {user.sellerStatus !== 'approved' ? <div className="pending-card"><span>⌛</span><div><h2>Seller approval in progress</h2><p>Your account is <b>{user.sellerStatus}</b>. An admin needs to approve your seller profile before you can publish products or fulfill orders.</p></div></div> :
        <div className="seller-layout">
          <section className="panel product-manager">
            <div className="panel-heading"><div><p className="eyebrow">YOUR CATALOG</p><h2>Products <span className="count-badge">{products.length}</span></h2></div></div>
            {!products.length ? <div className="inline-empty">No products yet. Add one to make it visible in the marketplace.</div> :
              <div className="seller-product-list">{products.map((product) => <div className="seller-product" key={product._id}>
                <div className="seller-product-thumb">{product.imageUrl && <img src={product.imageUrl} alt="" />}</div>
                <div className="seller-product-info"><b>{product.name}</b><small>{product.category} · {money(product.price)}</small></div>
                <div className="stock-adjust"><button aria-label={`Decrease ${product.name} stock`} onClick={() => updateStock(product, -1)}>−</button><span>{product.stock}</span><button aria-label={`Increase ${product.name} stock`} onClick={() => updateStock(product, 1)}>+</button></div>
                <button className="text-button" onClick={() => editProduct(product)}>Edit</button>
                <button className="text-button danger-text" onClick={() => archive(product)}>Archive</button>
              </div>)}</div>}
            <div className="flow-explainer compact"><span className="flow-explainer-icon">↔</span><p><b>Inventory lesson</b> Checkout reserves units with an atomic stock check. Try lowering stock while another account checks out.</p></div>
          </section>
          <section className="panel add-product-panel">
            <p className="eyebrow">{editingId ? 'EDIT LISTING' : 'NEW LISTING'}</p><h2 id="product-editor">{editingId ? 'Update your product' : 'Add a product'}</h2><p className="panel-intro">Published listings appear in the buyer's catalog immediately.</p>
            <form className="form-stack" onSubmit={createProduct}>
              <label>Product name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Description<textarea required maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <div className="form-grid"><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Price (INR)<input type="number" min="0" step="0.01" required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Stock<input type="number" min="0" step="1" required value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></label></div>
              <label>Image URL <span className="label-optional">Cloudinary upload is optional</span><input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" /></label>
              <label>Upload image<input type="file" accept="image/*" onChange={uploadImage} /></label>
              <button className="button button-dark button-wide" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes →' : 'Publish listing →'}</button>
              {editingId && <button className="button button-outline button-wide" type="button" onClick={() => { setEditingId(''); setForm(initialProduct); }}>Cancel editing</button>}
            </form>
          </section>
        </div>}
      <div className="seller-order-hint"><span className="order-hint-icon">↗</span><p><b>Fulfill an order</b> Once a buyer pays, use the Orders tab to process it, add demo tracking, and mark delivery.</p></div>
    </div>
  );
}
