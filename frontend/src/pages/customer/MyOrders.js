import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { orderAPI } from '../../services/api';
import { localOrders } from '../../services/localStore';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getUserOrders(user.id);
      const apiOrders = res.data || [];
      // Merge with local orders (in case some were created offline)
      const local = localOrders.getByUser(user.id);
      const allOrders = [...apiOrders, ...local];
      // Deduplicate by ID
      const seen = new Set();
      const unique = allOrders.filter(o => {
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
      });
      unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(unique);
    } catch {
      // Backend unavailable — show local orders only
      setOrders(localOrders.getByUser(user.id));
    }
    setLoading(false);
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    PREPARING: 'bg-purple-100 text-purple-700 border-purple-200',
    READY: 'bg-green-100 text-green-700 border-green-200',
    DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusIcons = {
    PENDING: '⏳', CONFIRMED: '✅', PREPARING: '🧑‍🍳',
    READY: '🎉', DELIVERED: '📦', CANCELLED: '❌',
  };

  const parseItems = (items) => {
    try {
      return typeof items === 'string' ? JSON.parse(items) : (items || []);
    } catch {
      return [];
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <p className="text-6xl mb-4">🔒</p>
        <h2 className="text-2xl font-display font-bold text-pr-800 mb-2">Sign In Required</h2>
        <p className="text-pr-500">Please sign in to view your orders.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse-soft">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-pr-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-pr-800 mb-3">
          My <span className="gradient-text">Orders</span>
        </h1>
        <p className="text-pr-500">Track all your juice orders in one place.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-pr-100 mb-6">
            <span className="text-5xl">🥤</span>
          </div>
          <h3 className="text-xl font-display font-bold text-pr-700 mb-2">No orders yet</h3>
          <p className="text-pr-500 mb-6">You haven't placed any orders. Start by exploring our menu!</p>
          <a href="/menu" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-105 transition-all">
            Explore Menu
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const items = parseItems(order.items);
            return (
              <div key={order.id} className="glass rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-pr-100">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusIcons[order.status] || '📋'} {order.status}
                    </div>
                    <span className="text-sm font-mono text-pr-500">{order.orderNumber || `#${order.id}`}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-pr-500">
                    <span>{order.orderType === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-pr-800 font-medium">{item.name}</span>
                          <span className="text-pr-400 text-xs">×{item.qty}</span>
                          {item.size && <span className="px-2 py-0.5 text-xs bg-pr-100 text-pr-600 rounded-full">{item.size}</span>}
                        </div>
                        <span className="font-semibold text-pr-700">₹{(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-pr-100">
                    <span className="font-semibold text-pr-700">Total</span>
                    <span className="text-lg font-display font-bold text-pr-800">₹{(order.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
