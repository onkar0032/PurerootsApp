import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { menuAPI, orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import JuiceCard from '../../components/JuiceCard';
import staticJuices from '../../data/juices';
import { localCart, localOrders } from '../../services/localStore';

const STORAGE_KEY = 'pureroots_local_juices';

const getLocalJuices = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
};
const saveLocalJuices = (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

const emptyDrink = { name:'', description:'', category:'classic', basePrice:'', ingredients:'', calories:'', isAvailable:true, isSeasonal:false };

const Menu = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isOwner = user?.role === 'OWNER';

  const [juices, setJuices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Customer-only state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ orderType:'PICKUP', deliveryAddress:'', deliveryNotes:'', paymentMethod:'CASH' });

  // Owner-only state
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [editingJuice, setEditingJuice] = useState(null);
  const [drinkForm, setDrinkForm] = useState(emptyDrink);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const categories = [
    { key:'all', label:'All Juices', icon:'🥤' },
    { key:'classic', label:'Classic', icon:'🍊' },
    { key:'detox', label:'Detox', icon:'🥬' },
    { key:'wellness', label:'Wellness', icon:'💪' },
    { key:'seasonal', label:'Seasonal', icon:'🌸' },
  ];

  useEffect(() => { fetchJuices(); }, []);

  useEffect(() => {
    if (user && !isOwner) { const saved = localCart.get(user.id); if (saved.length) setCart(saved); }
    else setCart([]);
  }, [user, isOwner]);

  useEffect(() => { if (user && !isOwner) localCart.save(user.id, cart); }, [cart, user, isOwner]);

  const fetchJuices = async () => {
    try {
      const res = await menuAPI.getMenu();
      const raw = res.data?.length ? res.data : (getLocalJuices() || staticJuices);
      const data = raw.map(j => ({
        ...j,
        ingredients: Array.isArray(j.ingredients) ? j.ingredients : (j.ingredients ? j.ingredients.split(',').map(s=>s.trim()) : []),
      }));
      setJuices(data);
      if (!getLocalJuices()) saveLocalJuices(data);
    } catch {
      const raw = getLocalJuices() || staticJuices;
      const data = raw.map(j => ({
        ...j,
        ingredients: Array.isArray(j.ingredients) ? j.ingredients : (j.ingredients ? j.ingredients.split(',').map(s=>s.trim()) : []),
      }));
      setJuices(data);
      if (!getLocalJuices()) saveLocalJuices(data);
    }
    setLoading(false);
  };

  const filteredJuices = juices.filter(j => {
    const matchCat = activeCategory === 'all' || j.category === activeCategory;
    const matchSearch = !searchQuery || j.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Customer helpers ──
  const addToCart = (juice) => {
    if (!user) { toast.warning('Please sign in to add items'); return; }
    const ex = cart.find(i => i.id === juice.id);
    if (ex) setCart(cart.map(i => i.id === juice.id ? {...i, qty: i.qty+1} : i));
    else setCart([...cart, {...juice, qty:1, size:'Medium'}]);
    toast.success(`${juice.name} added!`);
  };
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const updateQty = (id, d) => setCart(cart.map(i => i.id !== id ? i : {...i, qty: Math.max(1, i.qty+d)}));
  const cartTotal = cart.reduce((s,i) => s + i.basePrice*i.qty, 0);

  const handleCheckout = async () => {
    if (!user) { toast.warning('Please sign in'); return; }
    if (!cart.length) { toast.warning('Cart is empty'); return; }
    if (checkoutData.orderType==='DELIVERY' && !checkoutData.deliveryAddress.trim()) { toast.warning('Enter delivery address'); return; }
    const orderItems = cart.map(i => ({ juiceId:i.id, name:i.name, size:i.size, qty:i.qty, price:i.basePrice }));
    try {
      await orderAPI.createOrder({ userId:user.id, email:user.email, fullName:user.fullName, items:JSON.stringify(orderItems), totalAmount:cartTotal, ...checkoutData });
      toast.success('Order placed! 🎉'); setCart([]); setShowCheckout(false); setShowCart(false);
    } catch {
      try {
        localOrders.create(user.id, { items:JSON.stringify(orderItems), totalAmount:cartTotal, ...checkoutData });
        toast.success('Order placed! 🎉 (saved locally)'); setCart([]); setShowCheckout(false); setShowCart(false);
      } catch { toast.error('Failed to place order'); }
    }
  };

  // ── Owner helpers ──
  const openAddDrink = () => { setEditingJuice(null); setDrinkForm(emptyDrink); setShowDrinkModal(true); };
  const openEditDrink = (juice) => {
    setEditingJuice(juice);
    setDrinkForm({
      name: juice.name, description: juice.description||'', category: juice.category,
      basePrice: juice.basePrice?.toString()||'', ingredients: (juice.ingredients||[]).join(', '),
      calories: juice.calories?.toString()||'', isAvailable: juice.isAvailable!==false, isSeasonal: !!juice.isSeasonal,
    });
    setShowDrinkModal(true);
  };

  const handleSaveDrink = () => {
    if (!drinkForm.name.trim()) { toast.warning('Name is required'); return; }
    if (!drinkForm.basePrice || isNaN(drinkForm.basePrice)) { toast.warning('Valid price required'); return; }
    const ings = drinkForm.ingredients.split(',').map(s=>s.trim()).filter(Boolean);
    const newJuice = {
      id: editingJuice ? editingJuice.id : Date.now(),
      name: drinkForm.name.trim(), description: drinkForm.description.trim(), category: drinkForm.category,
      basePrice: parseFloat(drinkForm.basePrice), ingredients: ings,
      calories: drinkForm.calories ? parseInt(drinkForm.calories) : null,
      isAvailable: drinkForm.isAvailable, isSeasonal: drinkForm.isSeasonal,
      customizations: editingJuice?.customizations || '{"add_ons":["Honey","Ginger","Mint"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}',
    };
    let updated;
    if (editingJuice) {
      updated = juices.map(j => j.id === editingJuice.id ? newJuice : j);
      toast.success(`${newJuice.name} updated!`);
    } else {
      updated = [...juices, newJuice];
      toast.success(`${newJuice.name} added!`);
    }
    setJuices(updated); saveLocalJuices(updated);
    setShowDrinkModal(false);
  };

  const handleRemoveDrink = (juice) => {
    const updated = juices.filter(j => j.id !== juice.id);
    setJuices(updated); saveLocalJuices(updated);
    toast.success(`${juice.name} removed`);
    setShowDeleteConfirm(null);
  };

  // ── Shared input class ──
  const inputCls = "w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm transition";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-pr-800 mb-3">
          {isOwner ? 'Manage ' : 'Our '}<span className="gradient-text">Menu</span>
        </h1>
        <p className="text-pr-500 max-w-lg mx-auto">
          {isOwner ? 'Add, edit, or remove drinks from your menu.' : 'Handcrafted juices for every mood and moment.'}
        </p>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <input type="text" placeholder="Search juices..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm" />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pr-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isOwner ? (
          <button onClick={openAddDrink}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-orange-300/30 hover:scale-105 transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Drink
          </button>
        ) : (
          <button onClick={()=>setShowCart(true)} className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-105 transition-all">
            🛒 Cart
            {cart.length>0 && <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat.key} onClick={()=>setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory===cat.key ? 'bg-pr-500 text-white shadow-lg shadow-pr-500/30' : 'bg-white/60 text-pr-600 hover:bg-pr-100'}`}>
            {cat.icon} {cat.label}
          </button>
        ))}
        {isOwner && <span className="ml-auto text-sm text-pr-400 self-center">{filteredJuices.length} drinks</span>}
      </div>

      {/* Juice Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse"><div className="h-48 bg-pr-100 rounded-t-2xl"/><div className="p-5 space-y-3"><div className="h-4 bg-pr-100 rounded w-3/4"/><div className="h-3 bg-pr-100 rounded w-full"/></div></div>
          ))}
        </div>
      ) : filteredJuices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-display font-bold text-pr-700 mb-2">No juices found</h3>
          <p className="text-pr-500">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJuices.map(juice => (
            <JuiceCard key={juice.id} juice={juice}
              {...(isOwner
                ? { onEdit: openEditDrink, onRemove: (j) => setShowDeleteConfirm(j) }
                : { onAddToCart: addToCart, onCustomize: (j)=>navigate('/customizer',{state:{juice:j}}) }
              )} />
          ))}
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl shadow-2xl p-8 animate-slide-up text-center">
            <p className="text-5xl mb-4">🗑️</p>
            <h3 className="text-lg font-display font-bold text-pr-800 mb-2">Remove {showDeleteConfirm.name}?</h3>
            <p className="text-sm text-pr-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setShowDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-pr-100 text-pr-700 font-medium hover:bg-pr-200 transition">Cancel</button>
              <button onClick={()=>handleRemoveDrink(showDeleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:bg-red-600 transition">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Drink Modal (Owner) ── */}
      {showDrinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-pr-800">{editingJuice ? 'Edit Drink' : 'Add New Drink'}</h2>
              <button onClick={()=>setShowDrinkModal(false)} className="text-pr-400 hover:text-pr-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pr-700 mb-1">Drink Name *</label>
                <input value={drinkForm.name} onChange={e=>setDrinkForm({...drinkForm,name:e.target.value})} placeholder="e.g. Tropical Sunrise" className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-pr-700 mb-1">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.filter(c=>c.key!=='all').map(cat=>(
                    <button type="button" key={cat.key} onClick={()=>setDrinkForm({...drinkForm,category:cat.key})}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${drinkForm.category===cat.key ? 'bg-pr-500 text-white shadow-md' : 'bg-pr-50 text-pr-600 hover:bg-pr-100'}`}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-pr-700 mb-1">Price (₹) *</label>
                  <input type="number" step="1" value={drinkForm.basePrice} onChange={e=>setDrinkForm({...drinkForm,basePrice:e.target.value})} placeholder="99" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-pr-700 mb-1">Calories</label>
                  <input type="number" value={drinkForm.calories} onChange={e=>setDrinkForm({...drinkForm,calories:e.target.value})} placeholder="120" className={inputCls}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-pr-700 mb-1">Ingredients</label>
                <input value={drinkForm.ingredients} onChange={e=>setDrinkForm({...drinkForm,ingredients:e.target.value})} placeholder="Orange, Mango, Lime (comma separated)" className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-pr-700 mb-1">Description</label>
                <textarea value={drinkForm.description} onChange={e=>setDrinkForm({...drinkForm,description:e.target.value})} rows={2} placeholder="A refreshing blend of..." className={inputCls + ' resize-none'}/>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={drinkForm.isAvailable} onChange={e=>setDrinkForm({...drinkForm,isAvailable:e.target.checked})} className="w-4 h-4 rounded text-pr-500 focus:ring-pr-400"/>
                  <span className="text-sm text-pr-700 font-medium">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={drinkForm.isSeasonal} onChange={e=>setDrinkForm({...drinkForm,isSeasonal:e.target.checked})} className="w-4 h-4 rounded text-pr-500 focus:ring-pr-400"/>
                  <span className="text-sm text-pr-700 font-medium">Seasonal</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setShowDrinkModal(false)} className="flex-1 py-3 rounded-xl bg-pr-100 text-pr-700 font-medium hover:bg-pr-200 transition">Cancel</button>
                <button onClick={handleSaveDrink}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all">
                  {editingJuice ? 'Save Changes' : 'Add Drink'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cart Slide-over (Customer only) ── */}
      {!isOwner && showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setShowCart(false)}/>
          <div className="relative w-full max-w-md bg-white shadow-2xl animate-slide-up flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-pr-100">
              <h2 className="text-xl font-display font-bold text-pr-800">Your Cart</h2>
              <button onClick={()=>setShowCart(false)} className="text-pr-400 hover:text-pr-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!user ? (
                <div className="text-center py-16"><p className="text-5xl mb-4">🔒</p><p className="text-pr-500 font-medium">Please sign in to use your cart</p></div>
              ) : cart.length===0 ? (
                <div className="text-center py-16"><p className="text-5xl mb-4">🛒</p><p className="text-pr-500">Your cart is empty</p></div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-pr-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-pr-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-pr-500">₹{item.basePrice} × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>updateQty(item.id,-1)} className="w-7 h-7 rounded-lg bg-pr-200 text-pr-700 flex items-center justify-center font-bold text-sm hover:bg-pr-300 transition">−</button>
                        <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                        <button onClick={()=>updateQty(item.id,1)} className="w-7 h-7 rounded-lg bg-pr-200 text-pr-700 flex items-center justify-center font-bold text-sm hover:bg-pr-300 transition">+</button>
                        <button onClick={()=>removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length>0 && (
              <div className="p-6 border-t border-pr-100">
                <div className="flex justify-between mb-4"><span className="font-semibold text-pr-700">Total</span><span className="text-xl font-display font-bold text-pr-800">₹{cartTotal}</span></div>
                <button onClick={()=>{setShowCart(false);setShowCheckout(true);}} className="w-full py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all">Proceed to Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout Modal (Customer only) ── */}
      {!isOwner && showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-pr-800 mb-6">Checkout</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pr-700 mb-2">Order Type</label>
                <div className="flex gap-3">
                  {['PICKUP','DELIVERY'].map(t=>(
                    <button key={t} onClick={()=>setCheckoutData({...checkoutData,orderType:t})}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${checkoutData.orderType===t?'bg-pr-500 text-white shadow-lg':'bg-pr-50 text-pr-600 hover:bg-pr-100'}`}>
                      {t==='PICKUP'?'🏪 Pickup':'🚚 Delivery'}
                    </button>
                  ))}
                </div>
              </div>
              {checkoutData.orderType==='DELIVERY' && (
                <div><label className="block text-sm font-semibold text-pr-700 mb-2">Delivery Address</label>
                  <textarea value={checkoutData.deliveryAddress} onChange={e=>setCheckoutData({...checkoutData,deliveryAddress:e.target.value})} rows={2} placeholder="Enter your delivery address" className={inputCls+' resize-none'}/></div>
              )}
              <div><label className="block text-sm font-semibold text-pr-700 mb-2">Notes (optional)</label>
                <input type="text" value={checkoutData.deliveryNotes} onChange={e=>setCheckoutData({...checkoutData,deliveryNotes:e.target.value})} placeholder="Any special instructions?" className={inputCls}/></div>
              <div><label className="block text-sm font-semibold text-pr-700 mb-2">Payment</label>
                <select value={checkoutData.paymentMethod} onChange={e=>setCheckoutData({...checkoutData,paymentMethod:e.target.value})} className={inputCls}>
                  <option value="CASH">Cash on Pickup/Delivery</option><option value="CARD">Credit/Debit Card</option><option value="UPI">UPI</option>
                </select></div>
              <div className="flex justify-between items-center pt-4 border-t border-pr-100"><span className="text-lg font-display font-bold text-pr-800">Total: ₹{cartTotal}</span></div>
              <div className="flex gap-3">
                <button onClick={()=>setShowCheckout(false)} className="flex-1 py-3 rounded-xl bg-pr-100 text-pr-700 font-medium hover:bg-pr-200 transition">Cancel</button>
                <button onClick={handleCheckout} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all">Place Order 🎉</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
