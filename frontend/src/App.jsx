import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import ProductPage from './pages/ProductPage';
import Register from './pages/Register';
import Login from './pages/Login';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Profile from './pages/ProfilePage/Profile';
import OrdersHistory from './pages/ProfilePage/OrdersHistory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<Explore />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/me/cart" element={<CartPage />} />
      <Route path='/checkout' element={<CheckoutPage />} />

      <Route path="/profile">
        <Route index element={<Profile />} />
        <Route path="orders" element={<OrdersHistory />} />
      </Route>


    </Routes>
  )
}

export default App;