import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { authAPI } from '../services/api';
import localAuth from '../services/localAuth';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, login, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: '', address: ''
  });
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = (path) => location.pathname === path;

  const validateForm = () => {
    const errors = {};
    if (!isLogin && !formData.fullName.trim()) errors.fullName = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Min 6 characters';
    if (!isLogin && formData.phone && !/^\+?[\d\s-]{7,15}$/.test(formData.phone)) errors.phone = 'Invalid phone';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    let userData = null;
    let errorMsg = null;

    if (isLogin) {
      // LOGIN: try backend first, then fallback to local + sync
      try {
        const res = await authAPI.login({ email: formData.email, password: formData.password });
        userData = res.data;
      } catch {
        // Backend login failed — try local auth
        const result = localAuth.login({ email: formData.email, password: formData.password });
        if (result.success) {
          // User exists locally but not in backend — try to sync/register them
          try {
            const regRes = await authAPI.register({
              fullName: result.data.fullName,
              email: result.data.email,
              password: formData.password,
              phone: result.data.phone || '',
              role: selectedRole,
            });
            userData = regRes.data; // Now has a real DB id
          } catch {
            // Backend unreachable or email conflict — use local data
            userData = result.data;
          }
        } else {
          errorMsg = result.error;
        }
      }
      // Override role with selected toggle
      if (userData) {
        userData = { ...userData, role: selectedRole };
      }
    } else {
      // REGISTER: try backend first, then fallback to local
      try {
        const res = await authAPI.register({ ...formData, role: selectedRole });
        userData = res.data;
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          // Backend is up and returned a specific error (e.g. email taken)
          // Still try local in case it's a different store
          const result = localAuth.register({ ...formData, role: selectedRole });
          if (result.success) {
            userData = result.data;
          } else {
            errorMsg = err.response.data.error;
          }
        } else {
          // Backend unreachable
          const result = localAuth.register({ ...formData, role: selectedRole });
          if (result.success) {
            userData = result.data;
          } else {
            errorMsg = result.error;
          }
        }
      }
    }

    if (userData) {
      login(userData);
      toast.success(isLogin ? `Welcome back, ${userData.fullName}!` : 'Account created successfully!');
      setShowAuthModal(false);
      setFormData({ fullName: '', email: '', password: '', phone: '', address: '' });
      setSelectedRole('CUSTOMER');
      setFormErrors({});
    } else {
      toast.error(errorMsg || 'Authentication failed');
    }

    setIsSubmitting(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Logged out successfully');
  };

  const customerLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/customizer', label: 'Build Juice' },
  ];

  // Add "My Orders" for logged-in customers
  const customerAuthLinks = user ? [
    ...customerLinks,
    { path: '/my-orders', label: 'My Orders' },
  ] : customerLinks;

  const ownerLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/owner/dashboard', label: 'Dashboard' },
    { path: '/owner/inventory', label: 'Inventory' },
    { path: '/owner/sales', label: 'Sales' },
  ];

  const navLinks = user?.role === 'OWNER' ? ownerLinks : customerAuthLinks;

  return (
    <>
      <nav className="sticky top-0 z-50 glass shadow-lg shadow-pr-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pr-500 to-pr-700 flex items-center justify-center shadow-lg shadow-pr-500/30 group-hover:shadow-pr-500/50 transition-all duration-300">
                <span className="text-white font-display font-bold text-lg">🍃</span>
              </div>
              <span className="text-xl font-display font-bold text-pr-800 hidden sm:block">
                Pure <span className="text-pr-500">Roots</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-pr-500 text-white shadow-lg shadow-pr-500/30'
                      : 'text-pr-700 hover:bg-pr-100 hover:text-pr-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth / Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-pr-800">{user.fullName}</p>
                    <p className="text-xs text-pr-500">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pr-400 to-pr-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-pr-600 hover:text-red-500 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setIsLogin(true); }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold text-sm shadow-lg shadow-pr-500/30 hover:shadow-pr-500/50 hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-pr-100 transition"
              >
                <svg className="w-6 h-6 text-pr-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="md:hidden pb-4 animate-slide-up">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium mt-1 transition-all ${
                    isActive(link.path)
                      ? 'bg-pr-500 text-white'
                      : 'text-pr-700 hover:bg-pr-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl shadow-2xl p-8 animate-slide-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowAuthModal(false); setFormErrors({}); }}
              className="absolute top-4 right-4 text-pr-400 hover:text-pr-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-display font-bold text-pr-800 mb-1">
              {isLogin ? 'Welcome Back' : 'Join Pure Roots'}
            </h2>
            <p className="text-sm text-pr-500 mb-4">
              {isLogin ? 'Sign in to your account' : 'Create your account to start ordering'}
            </p>

            {/* Role Toggle */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-pr-600 mb-2 uppercase tracking-wide">I am a</p>
              <div className="flex rounded-xl bg-pr-100/80 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-white text-pr-700 shadow-md shadow-pr-200/50'
                      : 'text-pr-400 hover:text-pr-600'
                  }`}
                >
                  🛒 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('OWNER')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedRole === 'OWNER'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-orange-200/50'
                      : 'text-pr-400 hover:text-pr-600'
                  }`}
                >
                  👑 Owner
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.fullName ? 'border-red-400' : 'border-pr-200'} bg-white/70 focus:ring-2 focus:ring-pr-400 focus:border-transparent outline-none transition text-sm`}
                  />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-400' : 'border-pr-200'} bg-white/70 focus:ring-2 focus:ring-pr-400 focus:border-transparent outline-none transition text-sm`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.password ? 'border-red-400' : 'border-pr-200'} bg-white/70 focus:ring-2 focus:ring-pr-400 focus:border-transparent outline-none transition text-sm`}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              {!isLogin && (
                <>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border ${formErrors.phone ? 'border-red-400' : 'border-pr-200'} bg-white/70 focus:ring-2 focus:ring-pr-400 focus:border-transparent outline-none transition text-sm`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  <textarea
                    placeholder="Delivery Address (optional)"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 focus:border-transparent outline-none transition text-sm resize-none"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg shadow-pr-500/30 hover:shadow-pr-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-sm text-pr-500 mt-4">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setIsLogin(!isLogin); setFormErrors({}); }}
                className="text-pr-600 font-semibold hover:text-pr-800 transition"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
