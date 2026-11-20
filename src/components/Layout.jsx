import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, setUser } from '../features/authSlice';
import api from '../api';

const linksForRole = (role) => {
  const links = [{ to: '/shop', label: 'Marketplace' }, { to: '/orders', label: 'Orders' }];
  if (role === 'seller') links.push({ to: '/seller', label: 'Seller studio' });
  if (role === 'admin') links.push({ to: '/admin', label: 'Admin desk' });
  return links;
};

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me').then(({ data }) => dispatch(setUser(data.user))).catch(() => {
      dispatch(clearCredentials());
    });
  }, [dispatch, token]);

  function signOut() {
    dispatch(clearCredentials());
    navigate('/');
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">e</span>
          <span>ERA <small>MARKETPLACE LAB</small></span>
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          {user ? linksForRole(user.role).map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {link.label}
            </NavLink>
          )) : <span className="nav-note">A guided tour of how marketplace flows work</span>}
        </nav>
        <div className="topbar-actions">
          {user && <NavLink className="cart-link" to="/cart" aria-label={`Cart, ${cartCount} items`}>Cart <b>{cartCount}</b></NavLink>}
          {user ? (
            <div className="user-menu">
              <span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
              <span className="user-name">{user.name}<small>{user.role}</small></span>
              <button className="button button-quiet button-small" onClick={signOut}>Sign out</button>
            </div>
          ) : <NavLink className="button button-dark button-small" to="/login">Sign in</NavLink>}
        </div>
      </header>
      <main className="page-wrap"><Outlet /></main>
      <footer className="footer">
        <span>ERA Marketplace Learning App</span>
        <span>Educational demo · payments are test-mode or simulated</span>
      </footer>
    </div>
  );
}
