import React, { useState, useEffect } from 'react';
import { menuAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [juices, setJuices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJuice, setEditingJuice] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: 'classic', basePrice: '',
    ingredients: '', calories: '', isAvailable: true, isSeasonal: false,
  });

  useEffect(() => { fetchJuices(); }, []);

  const fetchJuices = async () => {
    try {
      const res = await menuAPI.getAllJuices();
      setJuices(res.data);
    } catch { toast.error('Failed to load juices'); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', category: 'classic', basePrice: '', ingredients: '', calories: '', isAvailable: true, isSeasonal: false });
    setEditingJuice(null);
    setShowForm(false);
  };

  const handleEdit = (juice) => {
    setForm({
      name: juice.name, description: juice.description || '',
      category: juice.category, basePrice: juice.basePrice?.toString() || '',
      ingredients: juice.ingredients?.join(', ') || '',
      calories: juice.calories?.toString() || '',
      isAvailable: juice.isAvailable !== false, isSeasonal: juice.isSeasonal === true,
    });
    setEditingJuice(juice);
    setShowForm(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) { toast.warning('Juice name is required'); return false; }
    if (!form.basePrice || parseFloat(form.basePrice) <= 0) { toast.warning('Valid price is required'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      name: form.name, description: form.description, category: form.category,
      basePrice: parseFloat(form.basePrice),
      ingredients: form.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      calories: form.calories ? parseInt(form.calories) : null,
      isAvailable: form.isAvailable, isSeasonal: form.isSeasonal,
    };
    try {
      if (editingJuice) {
        await menuAPI.updateJuice(editingJuice.id, data);
        toast.success('Juice updated!');
      } else {
        await menuAPI.createJuice(data);
        toast.success('Juice created!');
      }
      resetForm();
      fetchJuices();
    } catch { toast.error('Failed to save juice'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this juice?')) return;
    try {
      await menuAPI.deleteJuice(id);
      toast.success('Juice deleted');
      fetchJuices();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id) => {
    try {
      await menuAPI.toggleAvailability(id);
      fetchJuices();
    } catch { toast.error('Failed to toggle availability'); }
  };

  const catColors = { classic: 'from-amber-400 to-orange-500', detox: 'from-emerald-400 to-teal-500', wellness: 'from-rose-400 to-pink-500', seasonal: 'from-violet-400 to-purple-500' };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse-soft"><p className="text-5xl mb-4">📦</p><p className="text-pr-500">Loading inventory...</p></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-pr-800 mb-1">Inventory</h1>
          <p className="text-pr-500">{juices.length} juices in catalog</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-105 transition-all">
          + Add Juice
        </button>
      </div>

      {/* Juice Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-pr-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-pr-500 uppercase">Juice</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-pr-500 uppercase">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-pr-500 uppercase">Price</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-pr-500 uppercase">Calories</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-pr-500 uppercase">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-pr-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pr-50">
              {juices.map(juice => (
                <tr key={juice.id} className="hover:bg-pr-50/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catColors[juice.category] || catColors.classic} flex items-center justify-center text-lg shadow`}>
                        {juice.category === 'classic' ? '🍊' : juice.category === 'detox' ? '🥬' : juice.category === 'wellness' ? '💪' : '🌸'}
                      </div>
                      <div>
                        <p className="font-semibold text-pr-800 text-sm">{juice.name}</p>
                        <p className="text-xs text-pr-400 truncate max-w-[200px]">{juice.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-medium bg-pr-100 text-pr-700 rounded-full capitalize">{juice.category}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-pr-800">₹{juice.basePrice}</td>
                  <td className="px-6 py-4 text-sm text-pr-500">{juice.calories || '—'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggle(juice.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                        juice.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                      {juice.isAvailable !== false ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(juice)} className="text-pr-500 hover:text-pr-700 text-sm font-medium mr-3 transition">Edit</button>
                    <button onClick={() => handleDelete(juice.id)} className="text-red-400 hover:text-red-600 text-sm font-medium transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-display font-bold text-pr-800 mb-6">
              {editingJuice ? 'Edit Juice' : 'Add New Juice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Juice Name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm" />
              <textarea placeholder="Description" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm">
                  <option value="classic">Classic</option>
                  <option value="detox">Detox</option>
                  <option value="wellness">Wellness</option>
                  <option value="seasonal">Seasonal</option>
                </select>
                <input type="number" step="0.01" placeholder="Price" value={form.basePrice}
                  onChange={e => setForm({...form, basePrice: e.target.value})}
                  className="px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm" />
              </div>
              <input type="text" placeholder="Ingredients (comma separated)" value={form.ingredients}
                onChange={e => setForm({...form, ingredients: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm" />
              <input type="number" placeholder="Calories" value={form.calories}
                onChange={e => setForm({...form, calories: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm" />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-pr-700 cursor-pointer">
                  <input type="checkbox" checked={form.isAvailable}
                    onChange={e => setForm({...form, isAvailable: e.target.checked})}
                    className="rounded border-pr-300 text-pr-500 focus:ring-pr-400" />
                  Available
                </label>
                <label className="flex items-center gap-2 text-sm text-pr-700 cursor-pointer">
                  <input type="checkbox" checked={form.isSeasonal}
                    onChange={e => setForm({...form, isSeasonal: e.target.checked})}
                    className="rounded border-pr-300 text-pr-500 focus:ring-pr-400" />
                  Seasonal
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-3 rounded-xl bg-pr-100 text-pr-700 font-medium hover:bg-pr-200 transition">Cancel</button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all">
                  {editingJuice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
