import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ProductPage from './pages/ProductPage';
import Register from './pages/Register';
import Login from './pages/Login';
import CartPage from './pages/Order/CartPage';
import CheckoutPage from './pages/Order/CheckoutPage';
import Profile from './pages/ProfilePage/Profile';
import OrdersHistory from './pages/ProfilePage/OrdersHistory';
import AdminApp from './admin/AdminApp';
import ProfileCart from './pages/ProfilePage/ProfileCart';
import { ProductList } from './admin/resources/pages/products/ProductList';
import OrderConfirmation from './pages/Order/OrderConfirmation';
import Reviews from './pages/ProfilePage/Reviews';
import SecurityPage from './pages/ProfilePage/SecurityPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<Explore />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path='/checkout' element={<CheckoutPage />} />
      <Route path='/order-confirmation/:orderId' element={<OrderConfirmation />} />

      <Route path="/profile">
        <Route index element={<Profile />} />
        <Route path="orders" element={<OrdersHistory />} />
        <Route path="cart" element={<ProfileCart />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="security" element={<SecurityPage />} />
      </Route>



      <Route path="/admin/*" element={<AdminApp />} />


    </Routes>
  )
}

export default App;