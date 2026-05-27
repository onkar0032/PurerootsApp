// ============================================
// Pure Roots — Local Store Service
// ============================================
// Stores orders, cart, and feedback PER USER in localStorage.
// Each user's data is keyed by their user ID.

const KEYS = {
  ORDERS: 'pureroots_orders',
  CART: 'pureroots_cart',
  FEEDBACK: 'pureroots_feedback',
};

// ==========================================
// Internal helpers
// ==========================================

const getStore = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveStore = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getUserData = (key, userId) => {
  const store = getStore(key);
  return store[userId] || [];
};

const setUserData = (key, userId, data) => {
  const store = getStore(key);
  store[userId] = data;
  saveStore(key, store);
};

// ==========================================
// ORDER operations (per-user)
// ==========================================

let orderCounter = parseInt(localStorage.getItem('pureroots_order_counter') || '1000', 10);

const localOrders = {
  /**
   * Create a new order for a user.
   */
  create: (userId, orderData) => {
    const orders = getUserData(KEYS.ORDERS, userId);
    orderCounter++;
    localStorage.setItem('pureroots_order_counter', orderCounter.toString());

    const newOrder = {
      id: Date.now(),
      orderNumber: `PR-${orderCounter}`,
      userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      orderType: orderData.orderType || 'PICKUP',
      deliveryAddress: orderData.deliveryAddress || '',
      deliveryNotes: orderData.deliveryNotes || '',
      paymentMethod: orderData.paymentMethod || 'CASH',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    setUserData(KEYS.ORDERS, userId, orders);
    return newOrder;
  },

  /**
   * Get all orders for a user.
   */
  getByUser: (userId) => {
    return getUserData(KEYS.ORDERS, userId);
  },

  /**
   * Get all orders (across all users — for owner dashboard).
   */
  getAll: () => {
    const store = getStore(KEYS.ORDERS);
    const allOrders = [];
    Object.values(store).forEach(userOrders => {
      allOrders.push(...userOrders);
    });
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return allOrders;
  },

  /**
   * Get active orders (not DELIVERED or CANCELLED).
   */
  getActive: () => {
    return localOrders.getAll().filter(o =>
      o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    );
  },

  /**
   * Update order status.
   */
  updateStatus: (orderId, newStatus) => {
    const store = getStore(KEYS.ORDERS);
    for (const userId of Object.keys(store)) {
      const orders = store[userId];
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = newStatus;
        orders[idx].updatedAt = new Date().toISOString();
        saveStore(KEYS.ORDERS, store);
        return orders[idx];
      }
    }
    return null;
  },

  /**
   * Cancel an order.
   */
  cancel: (orderId) => {
    return localOrders.updateStatus(orderId, 'CANCELLED');
  },
};

// ==========================================
// CART operations (per-user)
// ==========================================

const localCart = {
  /**
   * Get the user's cart.
   */
  get: (userId) => {
    return getUserData(KEYS.CART, userId);
  },

  /**
   * Save the user's cart.
   */
  save: (userId, cart) => {
    setUserData(KEYS.CART, userId, cart);
  },

  /**
   * Clear the user's cart.
   */
  clear: (userId) => {
    setUserData(KEYS.CART, userId, []);
  },
};

// ==========================================
// FEEDBACK operations (per-user)
// ==========================================

const localFeedback = {
  /**
   * Submit feedback.
   */
  submit: (userId, feedbackData) => {
    const allFeedback = getStore(KEYS.FEEDBACK);
    const globalList = allFeedback._all || [];

    const newFeedback = {
      id: Date.now(),
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      category: feedbackData.category || 'general',
      createdAt: new Date().toISOString(),
    };

    globalList.unshift(newFeedback);
    allFeedback._all = globalList;
    saveStore(KEYS.FEEDBACK, allFeedback);
    return newFeedback;
  },

  /**
   * Get all feedback (for owner dashboard).
   */
  getAll: () => {
    const allFeedback = getStore(KEYS.FEEDBACK);
    return allFeedback._all || [];
  },
};

// ==========================================
// ANALYTICS (derived from local data)
// ==========================================

const localAnalytics = {
  getDashboard: () => {
    const allOrders = localOrders.getAll();
    const allFeedback = localFeedback.getAll();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekStart);
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING');

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const avgRating = allFeedback.length > 0
      ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
      : 0;

    // Count unique users
    const uniqueUsers = new Set(allOrders.map(o => o.userId));

    return {
      todayRevenue,
      weekRevenue,
      totalOrders: allOrders.length,
      averageRating: parseFloat(avgRating),
      pendingOrders: pendingOrders.length,
      totalCustomers: uniqueUsers.size,
    };
  },
};

export { localOrders, localCart, localFeedback, localAnalytics };
