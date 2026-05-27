import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import Customizer from './pages/customer/Customizer';
import MyOrders from './pages/customer/MyOrders';

// Owner Pages
import Dashboard from './pages/owner/Dashboard';
import Inventory from './pages/owner/Inventory';
import SalesReport from './pages/owner/SalesReport';

// Auth Context
export const AuthContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedUser = localStorage.getItem('pureroots_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pureroots_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('pureroots_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pureroots_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pr-50">
        <div className="animate-pulse-soft">
          <h1 className="text-4xl font-display font-bold gradient-text">Pure Roots</h1>
          <p className="text-pr-600 mt-2 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-pr-50 via-white to-accent-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public / Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/customizer" element={<Customizer />} />
              <Route path="/my-orders" element={<MyOrders />} />

              {/* Owner Protected Routes */}
              <Route path="/owner/dashboard" element={
                <ProtectedRoute requiredRole="OWNER">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/owner/inventory" element={
                <ProtectedRoute requiredRole="OWNER">
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/owner/sales" element={
                <ProtectedRoute requiredRole="OWNER">
                  <SalesReport />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
