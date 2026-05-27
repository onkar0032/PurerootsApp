import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { localOrders, localAnalytics } from '../../services/localStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const SalesReport = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.allSettled([
        orderAPI.getDashboardAnalytics(),
        orderAPI.getAllOrders(),
      ]);

      // Use API data if fulfilled, local fallback otherwise
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data);
      } else {
        setAnalytics(localAnalytics.getDashboard());
      }

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data);
      } else {
        setOrders(localOrders.getAll());
        if (analyticsRes.status !== 'fulfilled') {
          toast.error('Failed to load sales data');
        }
      }
    } catch {
      // Complete network failure — load everything from local storage
      setAnalytics(localAnalytics.getDashboard());
      setOrders(localOrders.getAll());
    }
    setLoading(false);
  };

  const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4'];

  // Process chart data
  const dailyOrdersData = analytics?.dailyOrdersChart
    ? Object.entries(analytics.dailyOrdersChart).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: count,
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const dailyRevenueData = analytics?.dailyRevenueChart
    ? Object.entries(analytics.dailyRevenueChart).map(([date, rev]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: parseFloat(rev),
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  // Order status distribution
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const statusPieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Order type distribution
  const typeCounts = orders.reduce((acc, o) => {
    acc[o.orderType] = (acc[o.orderType] || 0) + 1;
    return acc;
  }, {});
  const typePieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse-soft"><p className="text-5xl mb-4">📊</p><p className="text-pr-500">Loading sales report...</p></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-pr-800 mb-1">Sales Report</h1>
        <p className="text-pr-500">Analytics and insights for your business</p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Today's Revenue", value: `₹${(analytics?.todayRevenue || 0)}`, icon: '💰', color: 'from-emerald-400 to-teal-500' },
          { label: 'This Week', value: `₹${(analytics?.weekRevenue || 0)}`, icon: '📊', color: 'from-blue-400 to-indigo-500' },
          { label: 'This Month', value: `₹${(analytics?.monthRevenue || 0)}`, icon: '📈', color: 'from-violet-400 to-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6 hover:shadow-xl transition-all group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
              {stat.icon}
            </div>
            <p className="text-sm text-pr-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-pr-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Daily Orders Bar Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold text-pr-800 mb-6">Daily Orders (Last 7 Days)</h3>
          {dailyOrdersData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-pr-400">No data available</div>
          )}
        </div>

        {/* Revenue Line Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold text-pr-800 mb-6">Daily Revenue (Last 7 Days)</h3>
          {dailyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 5, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-pr-400">No data available</div>
          )}
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold text-pr-800 mb-6">Order Status Distribution</h3>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-pr-400">No data available</div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold text-pr-800 mb-6">Order Type Split</h3>
          {typePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typePieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {typePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-pr-400">No data available</div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-display font-bold text-pr-800 mb-6">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-pr-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-pr-500 uppercase">Order #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-pr-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-pr-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-pr-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-pr-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pr-50">
              {orders.slice(0, 15).map(order => {
                const statusClr = {
                  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
                  PREPARING: 'bg-purple-100 text-purple-700', READY: 'bg-green-100 text-green-700',
                  DELIVERED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-700',
                };
                return (
                  <tr key={order.id} className="hover:bg-pr-50/30 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-pr-800">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusClr[order.status] || ''}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-pr-600">{order.orderType}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-pr-800">₹{order.totalAmount}</td>
                    <td className="px-4 py-3 text-sm text-pr-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12"><p className="text-pr-400">No orders yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
