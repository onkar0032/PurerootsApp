import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../App';
import { feedbackAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { localFeedback } from '../../services/localStore';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);
  const [allFeedback, setAllFeedback] = useState([]);
  const [filterStar, setFilterStar] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchFeedback = async () => {
    try {
      const res = await feedbackAPI.getAllFeedback();
      setAllFeedback(res.data || []);
    } catch {
      setAllFeedback(localFeedback.getAll());
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) { toast.warning('Please add a comment'); return; }
    setSubmitting(true);
    try {
      await feedbackAPI.submitFeedback({ userId: user?.id || null, ...feedbackForm });
      toast.success('Thank you for your feedback!');
      setFeedbackForm({ rating: 5, comment: '', category: 'general' });
      fetchFeedback();
    } catch {
      try {
        localFeedback.submit(user?.id || 'anonymous', feedbackForm);
        toast.success('Thank you for your feedback! (saved locally)');
        setFeedbackForm({ rating: 5, comment: '', category: 'general' });
        fetchFeedback();
      } catch {
        toast.error('Failed to submit feedback');
      }
    }
    setSubmitting(false);
  };

  const features = [
    { icon: '🍹', title: 'Fresh & Natural', desc: 'Cold-pressed from 100% organic fruits and vegetables.' },
    { icon: '🎨', title: 'Build Your Own', desc: 'Mix ingredients, sweetness, and add-ons for your perfect blend.' },
    { icon: '🚚', title: 'Pre-Order & Deliver', desc: 'Schedule pickup or get it delivered to your door.' },
    { icon: '🌿', title: 'Sustainably Sourced', desc: 'Partnered with local farms for the freshest produce.' },
  ];

  const popular = [
    { name: 'Sunrise Orange', emoji: '🍊', color: 'from-amber-400 to-orange-500', price: '₹69' },
    { name: 'Green Machine', emoji: '🥬', color: 'from-emerald-400 to-teal-500', price: '₹109' },
    { name: 'Immunity Shield', emoji: '🛡️', color: 'from-rose-400 to-pink-500', price: '₹119' },
    { name: 'Summer Breeze', emoji: '🥭', color: 'from-violet-400 to-purple-500', price: '₹129' },
  ];

  // ─── OWNER HOME PAGE ───────────────────────────────────────
  if (user?.role === 'OWNER') {
    return (
      <div className="animate-fade-in min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 100%)' }}>
        {/* Decorative blurs */}
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 -right-40 w-[400px] h-[400px] bg-indigo-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl" />

        <div className="text-center relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-sm font-medium mb-10 animate-slide-up border border-white/10">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
            Owner Portal — {user.fullName}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-tight mb-6 animate-slide-up text-white">
            We are the creators of{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              PureRoots
            </span>
          </h1>
          <p className="text-2xl sm:text-3xl font-display font-bold text-blue-200/80 mb-14 animate-slide-up">
            Built to Perfection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-slide-up">
            <Link to="/menu" className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300">
              Explore Menu
            </Link>
            <Link to="/owner/dashboard" className="px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-bold text-lg hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300">
              View Dashboard 📊
            </Link>
          </div>
        </div>

        {/* Bottom footer line */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-blue-400/40 text-xs font-medium">
          © 2026 Pure Roots — Owner Portal
        </div>
      </div>
    );
  }

  // ─── CUSTOMER HOME PAGE ───────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-pr-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-pr-100/80 backdrop-blur-sm text-pr-700 text-sm font-medium mb-8 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-pr-500 mr-2 animate-pulse" />
              Freshly pressed daily — Order now
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-tight mb-6 animate-slide-up">
              Nature's Best, <span className="gradient-text">Freshly Pressed</span> For You
            </h1>
            <p className="text-lg sm:text-xl text-pr-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
              Discover handcrafted juices made from the finest organic ingredients. Build your perfect blend or explore our curated menu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link to="/menu" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-bold text-lg shadow-xl shadow-pr-500/30 hover:shadow-pr-500/50 hover:scale-105 transition-all duration-300">
                Explore Menu
              </Link>
              <Link to="/customizer" className="px-8 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-pr-200 text-pr-700 font-bold text-lg hover:bg-pr-50 hover:border-pr-300 hover:scale-105 transition-all duration-300">
                Build Your Juice 🎨
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up">
            {popular.map((j, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center group hover:-translate-y-2 hover:shadow-xl transition-all duration-500 cursor-pointer">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${j.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {j.emoji}
                </div>
                <h4 className="font-semibold text-pr-800 text-sm">{j.name}</h4>
                <p className="text-pr-500 text-xs mt-1 font-medium">{j.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-pr-800 mb-4">Why Choose <span className="gradient-text">Pure Roots</span>?</h2>
            <p className="text-pr-500 max-w-xl mx-auto">We're committed to delivering the freshest, healthiest juices — crafted with care.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pr-100 to-pr-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-all shadow-md">
                  {f.icon}
                </div>
                <h3 className="text-lg font-display font-bold text-pr-800 mb-2">{f.title}</h3>
                <p className="text-sm text-pr-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gradient-to-br from-pr-900 to-pr-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">How It Works</h2>
            <p className="text-pr-300 max-w-xl mx-auto">From selection to sip — it's effortless.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Browse or Build', desc: 'Explore our menu or create your own unique blend.', icon: '📋' },
              { step: '02', title: 'Place Your Order', desc: 'Choose pickup or delivery and complete your order.', icon: '🛒' },
              { step: '03', title: 'Enjoy Fresh Juice', desc: 'We cold-press to order. Pick up or get it delivered!', icon: '🎉' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-pr-400/20 border border-pr-400/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-all">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">{item.step}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">{item.title}</h3>
                <p className="text-pr-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="glass rounded-3xl p-8 sm:p-10 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-pr-800 mb-2">Share Your Feedback</h2>
              <p className="text-pr-500">Help us make your juice experience better.</p>
            </div>
            <form onSubmit={handleFeedback} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-pr-700 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setFeedbackForm({...feedbackForm, rating: s})}
                      className={`text-3xl transition-all hover:scale-125 ${s <= feedbackForm.rating ? '' : 'grayscale opacity-30'}`}>⭐</button>
                  ))}
                </div>
              </div>
              <select value={feedbackForm.category} onChange={e => setFeedbackForm({...feedbackForm, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm">
                <option value="general">General</option>
                <option value="taste">Taste & Quality</option>
                <option value="service">Service</option>
                <option value="delivery">Delivery</option>
              </select>
              <textarea value={feedbackForm.comment} onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                rows={4} placeholder="Tell us about your experience..."
                className="w-full px-4 py-3 rounded-xl border border-pr-200 bg-white/70 focus:ring-2 focus:ring-pr-400 outline-none text-sm resize-none" />
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pr-500 to-pr-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      {allFeedback.length > 0 && (
        <section className="pb-24">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-pr-800 mb-2">Customer <span className="gradient-text">Reviews</span></h2>
              <p className="text-pr-500">What our customers are saying about us.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              {/* Star Filter */}
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-pr-200">
                <span className="text-sm font-medium text-pr-600 mr-2">Stars:</span>
                <button onClick={() => setFilterStar(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${filterStar === 0 ? 'bg-pr-500 text-white shadow' : 'text-pr-500 hover:bg-pr-100'}`}>All</button>
                {[5,4,3,2,1].map(s => (
                  <button key={s} onClick={() => setFilterStar(s)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${filterStar === s ? 'bg-pr-500 text-white shadow' : 'text-pr-500 hover:bg-pr-100'}`}>
                    {s}⭐
                  </button>
                ))}
              </div>
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-pr-200">
                <span className="text-sm font-medium text-pr-600 mr-2">Category:</span>
                {['all','general','taste','service','delivery'].map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${filterCategory === cat ? 'bg-pr-500 text-white shadow' : 'text-pr-500 hover:bg-pr-100'}`}>
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Cards */}
            {(() => {
              const filtered = allFeedback
                .filter(fb => filterStar === 0 || fb.rating === filterStar)
                .filter(fb => filterCategory === 'all' || fb.category === filterCategory)
                .slice(0, 5);
              if (filtered.length === 0) return (
                <div className="text-center py-12 glass rounded-2xl">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-pr-500">No reviews match your filters.</p>
                </div>
              );
              const catIcons = { general: '💬', taste: '🍹', service: '🤝', delivery: '🚚' };
              return (
                <div className="space-y-4">
                  {filtered.map((fb, i) => (
                    <div key={fb.id || i} className="glass rounded-2xl p-5 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex">{[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-lg ${s <= fb.rating ? '' : 'grayscale opacity-20'}`}>⭐</span>
                          ))}</div>
                          <span className="px-2.5 py-1 text-xs font-semibold bg-pr-100 text-pr-700 rounded-full capitalize">
                            {catIcons[fb.category] || '💬'} {fb.category}
                          </span>
                        </div>
                        {fb.createdAt && (
                          <span className="text-xs text-pr-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-pr-700 leading-relaxed">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      <footer className="bg-pr-950 text-pr-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-display font-bold text-white mb-3">🍃 Pure Roots</h3>
              <p className="text-sm leading-relaxed">Handcrafted juices from 100% organic ingredients. Freshly pressed daily for your health and happiness.</p>
              <a href="https://www.instagram.com/pureroots_official?igsh=cDNtZWUxZW1vN3hz" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white text-sm font-semibold shadow-lg hover:scale-105 hover:shadow-pink-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Follow us on Instagram
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <Link to="/menu" className="block text-sm hover:text-pr-400 transition">Menu</Link>
              <Link to="/customizer" className="block text-sm hover:text-pr-400 transition mt-1">Build Your Juice</Link>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact Us</h4>
              <p className="text-sm leading-relaxed">📍 Joggers Park Road, Near Joggers Park Police Chowki, Surat, Gujarat 395007</p>
              <p className="text-sm mt-2">📞 <a href="tel:+919773149231" className="hover:text-pr-400 transition">+91 9773149231</a></p>
              <p className="text-sm mt-1">👤 Mahesh Kumar Gurav</p>
            </div>
          </div>
          <div className="border-t border-pr-800 mt-10 pt-6 text-center text-xs text-pr-500">
            © 2026 Pure Roots. All rights reserved. Made with 💚
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
