// ============================================
// Pure Roots — Local Auth Service (Fallback)
// ============================================
// Used when the backend API is unavailable.
// Stores user accounts in localStorage.

const STORAGE_KEY = 'pureroots_accounts';

// Simple hash function for local password storage (NOT for production)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'local_' + Math.abs(hash).toString(36);
};

const getAccounts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

const localAuth = {
  /**
   * Register a new user locally.
   */
  register: ({ fullName, email, password, phone, address, role }) => {
    const accounts = getAccounts();

    // Check if email already exists
    const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'Email is already registered' };
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
      phone: phone || '',
      address: address || '',
      role: role || 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newUser);
    saveAccounts(accounts);

    // Return user data (without password)
    return {
      success: true,
      data: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        message: 'Registration successful',
      },
    };
  },

  /**
   * Login with email and password locally.
   */
  login: ({ email, password }) => {
    const accounts = getAccounts();
    const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Invalid email or password' };
    }

    return {
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        message: 'Login successful',
      },
    };
  },

  /**
   * Get user profile by ID.
   */
  getProfile: (userId) => {
    const accounts = getAccounts();
    const user = accounts.find(a => a.id === userId);
    if (!user) return null;
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    };
  },
};

export default localAuth;
