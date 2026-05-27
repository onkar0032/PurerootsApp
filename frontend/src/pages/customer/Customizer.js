import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import { menuAPI, orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import staticJuices from '../../data/juices';
import { localOrders } from '../../services/localStore';

const Customizer = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [juices, setJuices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBase, setSelectedBase] = useState(null);
  const [customSize, setCustomSize] = useState('Medium');
  const [customSweetness, setCustomSweetness] = useState('Regular');
  const [customIce, setCustomIce] = useState('Regular');
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const sizes = [
    { label: 'Small', price: 0, icon: 'S' },
    { label: 'Medium', price: 20, icon: 'M' },
    { label: 'Large', price: 40, icon: 'L' },
  ];
  const sweetnessLevels = ['None', 'Light', 'Regular'];
  const iceLevels = ['No Ice', 'Light', 'Regular', 'Extra'];
  const defaultAddOns = ['Chia Seeds', 'Protein Powder', 'Honey', 'Coconut Milk', 'Turmeric', 'Flax Seeds', 'Ginger Shot', 'Wheatgrass', 'Spirulina', 'Oat Milk'];
  const addOnPrice = 15;

  useEffect(() => {
    fetchJuices();
  }, []);

  useEffect(() => {
    if (location.state?.juice) {
      setSelectedBase(location.state.juice);
    }
  }, [location.state]);

  const fetchJuices = async () => {
    try {
      const res = await menuAPI.getMenu();
      const data = res.data && res.data.length > 0 ? res.data : staticJuices;
      setJuices(data);
      if (!location.state?.juice && data.length > 0) {
        setSelectedBase(data[0]);
      }
    } catch {
      // Fallback to static data when backend is unavailable
      setJuices(staticJuices);
      if (!location.state?.juice && staticJuices.length > 0) {
        setSelectedBase(staticJuices[0]);
      }
    }
    setLoading(false);
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev =>
      prev.includes(addOn) ? prev.filter(a => a !== addOn) : [...prev, addOn]
    );
  };

  const calculateTotal = () => {
    if (!selectedBase) return 0;
    const sizeExtra = sizes.find(s => s.label === customSize)?.price || 0;
    const addOnTotal = selectedAddOns.length * addOnPrice;
    return selectedBase.basePrice + sizeExtra + addOnTotal;
  };

  const handleOrder = async () => {
    if (!user) { toast.warning('Please sign in to place an order'); return; }
    if (!selectedBase) { toast.warning('Please select a base juice'); return; }

    const orderItems = [{
      juiceId: selectedBase.id, name: selectedBase.name, size: customSize,
      sweetness: customSweetness, ice: customIce, addOns: selectedAddOns,
      qty: 1, price: calculateTotal()
    }];

    try {
      await orderAPI.createOrder({
        userId: user.id, email: user.email, fullName: user.fullName,
        items: JSON.stringify(orderItems), totalAmount: calculateTotal(),
        orderType: 'PICKUP', paymentMethod: 'CASH'
      });
      toast.success('Custom juice ordered! 🎉');
    } catch {
      // Backend unavailable — save order locally per user
      try {
        localOrders.create(user.id, {
          items: JSON.stringify(orderItems),
          totalAmount: calculateTotal(),
          orderType: 'PICKUP',
          paymentMethod: 'CASH',
        });
        toast.success('Custom juice ordered! 🎉 (saved locally)');
      } catch {
        toast.error('Failed to place order');
      }
    }
  };

  const availableAddOns = (() => {
    if (selectedBase?.customizations) {
      try {
        const customs = typeof selectedBase.customizations === 'string'
          ? JSON.parse(selectedBase.customizations) : selectedBase.customizations;
        return customs.add_ons || defaultAddOns;
      } catch { return defaultAddOns; }
    }
    return defaultAddOns;
  })();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse-soft">
          <p className="text-5xl mb-4">🎨</p>
          <p className="text-pr-500 font-medium">Loading customizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-pr-800 mb-3">
          Build Your <span className="gradient-text">Perfect Juice</span>
        </h1>
        <p className="text-pr-500 max-w-lg mx-auto">Pick a base, customize everything, and make it yours.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Base Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Choose Base */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-pr-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pr-500 text-white text-sm flex items-center justify-center font-bold">1</span>
              Choose Your Base
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {juices.map(juice => {
                const catColors = { classic: 'from-amber-400 to-orange-500', detox: 'from-emerald-400 to-teal-500', wellness: 'from-rose-400 to-pink-500', seasonal: 'from-violet-400 to-purple-500' };
                const catIcons = { classic: '🍊', detox: '🥬', wellness: '💪', seasonal: '🌸' };
                return (
                  <button key={juice.id} onClick={() => setSelectedBase(juice)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                      selectedBase?.id === juice.id
                        ? 'ring-2 ring-pr-500 bg-pr-50 shadow-lg scale-[1.02]'
                        : 'bg-white/50 hover:bg-pr-50 hover:shadow'
                    }`}>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${catColors[juice.category] || catColors.classic} flex items-center justify-center text-xl mb-2`}>
                      {catIcons[juice.category] || '🥤'}
                    </div>
                    <h4 className="font-semibold text-pr-800 text-sm">{juice.name}</h4>
                    <p className="text-xs text-pr-500 mt-0.5">₹{juice.basePrice}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Size */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-pr-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pr-500 text-white text-sm flex items-center justify-center font-bold">2</span>
              Select Size
            </h2>
            <div className="flex gap-4">
              {sizes.map(size => (
                <button key={size.label} onClick={() => setCustomSize(size.label)}
                  className={`flex-1 py-6 rounded-xl text-center transition-all duration-300 ${
                    customSize === size.label
                      ? 'bg-pr-500 text-white shadow-lg shadow-pr-500/30 scale-105'
                      : 'bg-white/50 text-pr-700 hover:bg-pr-50'
                  }`}>
                  <span className={`text-2xl font-display font-bold block mb-1 ${customSize === size.label ? 'text-white' : 'text-pr-700'}`}>{size.icon}</span>
                  <span className="text-sm font-medium block">{size.label}</span>
                  <span className="text-xs opacity-75">{size.price > 0 ? `+₹${size.price}` : 'Base'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Sweetness & Ice */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-display font-bold text-pr-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-pr-500 text-white text-sm flex items-center justify-center font-bold">3</span>
                Sweetness
              </h2>
              <div className="space-y-2">
                {sweetnessLevels.map(level => (
                  <button key={level} onClick={() => setCustomSweetness(level)}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                      customSweetness === level ? 'bg-pr-500 text-white shadow-lg' : 'bg-white/50 text-pr-600 hover:bg-pr-50'
                    }`}>{level}</button>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-display font-bold text-pr-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-pr-500 text-white text-sm flex items-center justify-center font-bold">4</span>
                Ice Level
              </h2>
              <div className="space-y-2">
                {iceLevels.map(level => (
                  <button key={level} onClick={() => setCustomIce(level)}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                      customIce === level ? 'bg-pr-500 text-white shadow-lg' : 'bg-white/50 text-pr-600 hover:bg-pr-50'
                    }`}>{level}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Add-Ons */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-pr-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pr-500 text-white text-sm flex items-center justify-center font-bold">5</span>
              Add-Ons <span className="text-xs text-pr-400 font-normal">(+₹{addOnPrice} each)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableAddOns.map(addOn => (
                <button key={addOn} onClick={() => toggleAddOn(addOn)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedAddOns.includes(addOn)
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                      : 'bg-white/50 text-pr-600 hover:bg-pr-50'
                  }`}>{addOn}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary (sticky) */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-24 shadow-xl">
            <h2 className="text-lg font-display font-bold text-pr-800 mb-5">Your Custom Juice</h2>

            {selectedBase ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-pr-500">Base</span>
                    <span className="font-semibold text-pr-800">{selectedBase.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-pr-500">Size</span>
                    <span className="font-semibold text-pr-800">{customSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-pr-500">Sweetness</span>
                    <span className="font-semibold text-pr-800">{customSweetness}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-pr-500">Ice</span>
                    <span className="font-semibold text-pr-800">{customIce}</span>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div>
                      <span className="text-sm text-pr-500">Add-Ons</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAddOns.map(a => (
                          <span key={a} className="px-2 py-0.5 text-xs bg-accent-100 text-accent-700 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-pr-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-pr-500">Base Price</span>
                    <span>₹{selectedBase.basePrice}</span>
                  </div>
                  {sizes.find(s => s.label === customSize)?.price > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-pr-500">Size Upgrade</span>
                      <span>+₹{sizes.find(s => s.label === customSize).price}</span>
                    </div>
                  )}
                  {selectedAddOns.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-pr-500">Add-Ons ({selectedAddOns.length})</span>
                      <span>+₹{(selectedAddOns.length * addOnPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-pr-100">
                    <span className="font-bold text-pr-800">Total</span>
                    <span className="text-2xl font-display font-bold text-pr-700">₹{calculateTotal()}</span>
                  </div>
                </div>

                <button onClick={handleOrder}
                  className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg shadow-pr-500/30 hover:shadow-pr-500/50 hover:scale-[1.02] transition-all">
                  Order Now 🎉
                </button>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">👈</p>
                <p className="text-pr-500 text-sm">Select a base juice to start customizing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
