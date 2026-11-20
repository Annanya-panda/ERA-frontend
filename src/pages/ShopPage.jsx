import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../api';
import { addItem } from '../features/cartSlice';
import { money } from './HomePage';
import { Notice, PageHeading } from '../components/Notice';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState('');
  const [addedId, setAddedId] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category) params.set('category', category);
      if (sort === 'priceAsc' || sort === 'priceDesc') params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      api.get(`/products?${params}`).then(({ data }) => {
        setProducts(data.products);
        setError('');
      }).catch((reason) => setError(reason.response?.data?.message || 'Could not load products'));
    }, 220);
    return () => clearTimeout(timer);
  }, [category, maxPrice, minPrice, query, sort]);

  const categories = [...new Set(products.map((product) => product.category))];
  return (
    <div className="shop-page">
      <PageHeading eyebrow="THE MARKETPLACE" title="Find something good." description="Search a small demo catalog and follow the buyer journey from cart to delivery." />
      <div className="shop-toolbar">
        <label className="search-field"><span>⌕</span><input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or categories" /></label>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Recently added</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option>
        </select>
        <input aria-label="Minimum price" className="price-filter" type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min ₹" />
        <input aria-label="Maximum price" className="price-filter" type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max ₹" />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="catalog-count"><span>{products.length} curated finds</span><span>Seller-managed · stock-aware</span></div>
      <div className="product-grid">
        {products.map((product, index) => <article className="product-card" key={product._id}>
          <div className={`product-image product-image-${index % 4}`}>
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <div className="image-placeholder">ERA</div>}
            <span className="product-category">{product.category}</span>
          </div>
          <div className="product-info">
            <div className="product-title-row"><h2>{product.name}</h2><b>{money(product.price)}</b></div>
            <p>{product.description}</p>
            <div className="product-meta"><span>By {product.seller?.name || 'ERA seller'}</span><span>{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</span></div>
            <button className="button button-outline button-wide" disabled={product.stock < 1} onClick={() => {
              dispatch(addItem(product));
              setAddedId(product._id);
              setTimeout(() => setAddedId(''), 1500);
            }}>{product.stock < 1 ? 'Out of stock' : addedId === product._id ? 'Added to cart ✓' : 'Add to cart +'}</button>
          </div>
        </article>)}
      </div>
      {!products.length && !error && <div className="empty-state"><span>⌕</span><h2>No matches yet</h2><p>Try a different search or category.</p></div>}
      <div className="flow-explainer"><span className="flow-explainer-icon">01</span><p><b>What happens here?</b> The catalog comes from the API. Add-to-cart is stored in this browser; checkout will re-check the live price and stock on the server.</p></div>
    </div>
  );
}
