import React from 'react';

const JuiceCard = ({ juice, onCustomize, onAddToCart, onEdit, onRemove, compact = false }) => {
  const categoryColors = {
    classic: 'from-amber-400 to-orange-500',
    detox: 'from-emerald-400 to-teal-500',
    wellness: 'from-rose-400 to-pink-500',
    seasonal: 'from-violet-400 to-purple-500',
  };

  const categoryIcons = {
    classic: '🍊',
    detox: '🥬',
    wellness: '💪',
    seasonal: '🌸',
  };

  const gradient = categoryColors[juice.category] || categoryColors.classic;
  const icon = categoryIcons[juice.category] || '🥤';

  if (compact) {
    return (
      <div className="glass rounded-xl p-4 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-pr-800 truncate">{juice.name}</h4>
            <p className="text-sm text-pr-500">₹{juice.basePrice}</p>
          </div>
          {juice.isAvailable === false && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-lg">Unavailable</span>
          )}
        </div>
      </div>
    );
  }

  const isOwnerView = !!(onEdit || onRemove);

  return (
    <div className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-pr-200/50 transition-all duration-500 group hover:-translate-y-1">
      {/* Card Header - Gradient Background */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} p-6 flex items-end`}>
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {juice.isSeasonal && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-white/30 backdrop-blur-sm text-white rounded-full">
              Seasonal
            </span>
          )}
          {juice.calories && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-white/30 backdrop-blur-sm text-white rounded-full">
              {juice.calories} cal
            </span>
          )}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-30 group-hover:scale-125 group-hover:opacity-50 transition-all duration-500">
          {icon}
        </div>
        <div>
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/25 backdrop-blur-sm text-white rounded-full capitalize mb-2">
            {juice.category}
          </span>
          <h3 className="text-2xl font-display font-bold text-white drop-shadow-lg">{juice.name}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <p className="text-sm text-pr-600 leading-relaxed mb-4 line-clamp-2">{juice.description}</p>

        {/* Ingredients */}
        {juice.ingredients && juice.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {juice.ingredients.map((ing, i) => (
              <span key={i} className="px-2.5 py-0.5 text-xs bg-pr-100 text-pr-700 rounded-full font-medium">
                {ing}
              </span>
            ))}
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-pr-100">
          <div>
            <span className="text-2xl font-display font-bold text-pr-700">₹{juice.basePrice}</span>
            <span className="text-xs text-pr-400 ml-1">/ glass</span>
          </div>

          {/* Customer Actions */}
          {!isOwnerView && (
            <div className="flex items-center space-x-2">
              {onCustomize && (
                <button
                  onClick={() => onCustomize(juice)}
                  className="px-3 py-2 text-sm font-medium text-pr-600 bg-pr-50 hover:bg-pr-100 rounded-xl transition-all"
                >
                Customize
                </button>
              )}
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(juice)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pr-500 to-pr-600 rounded-xl shadow-md shadow-pr-500/20 hover:shadow-pr-500/40 hover:scale-105 transition-all duration-300"
                >
                  Add to Cart
                </button>
              )}
            </div>
          )}

          {/* Owner Actions */}
          {isOwnerView && (
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(juice)}
                  className="px-3.5 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-300 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(juice)}
                  className="px-3.5 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuiceCard;
