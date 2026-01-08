import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { LocationProvider } from './context/LocationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerRegister from './pages/SellerRegister';
import SellerLogin from './pages/SellerLogin';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import ProductNews from './pages/ProductNews';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import UserProfile from './pages/UserProfile';
import SeedData from './pages/SeedData';
import Browse from './pages/Browse';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <LocationProvider>
          <Router>
            <div className="app-container">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/seller/register" element={<SellerRegister />} />
                  <Route path="/seller/login" element={<SellerLogin />} />
                  <Route path="/seller/dashboard" element={<ProtectedRoute sellerOnly={true}><SellerDashboard /></ProtectedRoute>} />
                  <Route path="/seller/add-product" element={<ProtectedRoute sellerOnly={true}><AddProduct /></ProtectedRoute>} />
                  <Route path="/seller/edit-product/:id" element={<ProtectedRoute sellerOnly={true}><EditProduct /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
                  <Route path="/news" element={<ProductNews />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
                  <Route path="/admin/add-product" element={<ProtectedRoute adminOnly={true}><AddProduct /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/seed" element={<SeedData />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
              </main>
            </div>
          </Router>
        </LocationProvider>
      </CompareProvider>
    </AuthProvider>
  );
}

export default App;
