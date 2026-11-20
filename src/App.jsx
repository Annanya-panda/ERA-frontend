import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import SellerPage from './pages/SellerPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<LoginPage reset />} />
        <Route path="/shop" element={<RequireAuth><ShopPage /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="/seller" element={<RequireAuth roles={['seller']}><SellerPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminPage /></RequireAuth>} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
