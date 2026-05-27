import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, feedbackAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { localOrders, localFeedback, localAnalytics } from '../../services/localStore';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes, feedbackRes] = await Promise.allSettled([
        orderAPI.getDashboardAnalytics(),
        orderAPI.getActiveOrders(),
        feedbackAPI.getAllFeedback(),
      ]);

      // Each result is independent — use API data if fulfilled, local fallback otherwise
      setAnalytics(
        analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : localAnalytics.getDashboard()
      );
      setActiveOrders(
        ordersRes.status === 'fulfilled' ? ordersRes.value.data : localOrders.getActive()
      );
      setRecentFeedback(
        feedbackRes.status === 'fulfilled'
          ? feedbackRes.value.data.slice(0, 5)
          : localFeedback.getAll().slice(0, 5)
      );
    } catch {
      // Complete network failure — load everything from local storage
      setAnalytics(localAnalytics.getDashboard());
      setActiveOrders(localOrders.getActive());
      setRecentFeedback(localFeedback.getAll().slice(0, 5));
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      fetchData();
    } catch {
      // Try local update
      const updated = localOrders.updateStatus(orderId, newStatus);
      if (updated) {
        toast.success(`Order updated to ${newStatus} (locally)`);
        setAnalytics(localAnalytics.getDashboard());
        setActiveOrders(localOrders.getActive());
      } else {
        toast.error('Failed to update order status');
      }
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-purple-100 text-purple-700',
    READY: 'bg-green-100 text-green-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const nextStatus = { PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'DELIVERED' };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse-soft">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-pr-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Today's Revenue", value: `₹${(analytics?.todayRevenue || 0)}`, icon: '💰', color: 'from-emerald-400 to-teal-500' },
    { label: 'Weekly Revenue', value: `₹${(analytics?.weekRevenue || 0)}`, icon: '📈', color: 'from-blue-400 to-indigo-500' },
    { label: 'Total Orders', value: analytics?.totalOrders || 0, icon: '📦', color: 'from-amber-400 to-orange-500' },
    { label: 'Avg Rating', value: `${analytics?.averageRating || 0} ⭐`, icon: '⭐', color: 'from-yellow-400 to-amber-500' },
    { label: 'Pending', value: analytics?.pendingOrders || 0, icon: '⏳', color: 'from-red-400 to-rose-500' },
    { label: 'Customers', value: analytics?.totalCustomers || 0, icon: '👥', color: 'from-violet-400 to-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-pr-800 mb-1">Owner Dashboard</h1>
          <p className="text-pr-500">Overview of your juice business</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link to="/owner/inventory" className="px-4 py-2 rounded-xl bg-white/60 border border-pr-200 text-pr-700 text-sm font-medium hover:bg-pr-50 transition">
            Inventory
          </Link>
          <Link to="/owner/sales" className="px-4 py-2 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white text-sm font-semibold shadow-lg hover:scale-105 transition-all">
            Sales Report
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-4 hover:shadow-lg transition-all group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform shadow-md`}>
              {stat.icon}
            </div>
            <p className="text-xs text-pr-500 font-medium">{stat.label}</p>
            <p className="text-xl font-display font-bold text-pr-800 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Orders */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-pr-800">Live Orders</h2>
              <span className="px-3 py-1 text-xs font-semibold bg-pr-100 text-pr-700 rounded-full">
                {activeOrders.length} active
              </span>
            </div>
            {activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-pr-500">No active orders right now</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-pr-800 text-sm">{order.orderNumber}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-pr-500 mt-0.5">
                        {order.orderType} · ₹{order.totalAmount} · {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {nextStatus[order.status] && (
                        <button onClick={() => handleStatusUpdate(order.id, nextStatus[order.status])}
                          className="px-3 py-1.5 text-xs font-medium bg-pr-500 text-white rounded-lg hover:bg-pr-600 transition shadow">
                          → {nextStatus[order.status]}
                        </button>
                      )}
                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                          className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-pr-800 mb-6">Recent Feedback</h2>
            {recentFeedback.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-pr-500 text-sm">No feedback yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFeedback.map(fb => (
                  <div key={fb.id} className="p-3 rounded-xl bg-white/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{'⭐'.repeat(fb.rating)}</span>
                      <span className="text-xs text-pr-400 capitalize">{fb.category}</span>
                    </div>
                    <p className="text-sm text-pr-700 line-clamp-2">{fb.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
