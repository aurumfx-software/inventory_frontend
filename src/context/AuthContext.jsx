import React, { createContext, useContext, useState } from 'react';

const rolePermissionsMap = {
  'role-admin': [
    'sec-5', 'sec-6', 'sec-7', 'sec-8', 'sec-9', 'sec-10',
    'sec-11', 'sec-12', 'sec-13', 'sec-14', 'sec-15', 'sec-16', 'sec-17', 'sec-18', 'sec-19', 'sec-20',
    'sec-21', 'sec-22', 'sec-23', 'sec-24', 'sec-25', 'sec-26', 'sec-27', 'sec-28', 'sec-29', 'sec-30',
    'sec-31', 'sec-32', 'sec-33', 'sec-34', 'sec-35'
  ],
  'role-purchase': [
    'sec-5', 'sec-6', 'sec-7', 'sec-11', 'sec-14', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
  ],
  'role-store': [
    'sec-5', 'sec-6', 'sec-8', 'sec-9', 'sec-13', 'sec-17', 'sec-18', 'sec-19', 'sec-20', 'sec-21', 'sec-22', 'sec-23', 'sec-24', 'sec-25', 'sec-26', 'sec-27', 'sec-28', 'sec-29', 'sec-30'
  ],
  'role-dept-mgr': [
    'sec-5', 'sec-8', 'sec-11', 'sec-12', 'sec-20', 'sec-22', 'sec-29', 'sec-30'
  ],
  'role-requester': [
    'sec-5', 'sec-11', 'sec-22', 'sec-29'
  ],
  'role-finance': [
    'sec-5', 'sec-12', 'sec-15', 'sec-16', 'sec-20', 'sec-23', 'sec-29', 'sec-30'
  ],
  'role-auditor': [
    'sec-5', 'sec-19', 'sec-20', 'sec-26', 'sec-29', 'sec-30', 'sec-31'
  ],
  'role-director': [
    'sec-5', 'sec-11', 'sec-12', 'sec-13', 'sec-16', 'sec-29', 'sec-30'
  ]
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('app_current_user_obj');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return {
          ...u,
          permissions: rolePermissionsMap[u.role_id] || ['*']
        };
      }
    } catch (e) {}
    return null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('app_current_token') || null;
  });
  const [activeWarehouse, setActiveWarehouse] = useState('wh-01');
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Indent Submitted', message: 'Indent IND-2026-001001 requires approval', time: '10 mins ago', type: 'info', unread: true },
    { id: 2, title: 'Low Stock Warning', message: 'Dell Latitude Laptops reached reorder level (5 units left)', time: '1 hr ago', type: 'warning', unread: true },
    { id: 3, title: 'GRN Received', message: 'GRN-2026-004001 posted by Store Manager', time: '3 hrs ago', type: 'success', unread: false }
  ]);

  const clearDomainCaches = () => {
    const keysToRemove = [
      'app_items_master',
      'app_warehouses_master',
      'app_departments_master',
      'app_locations_master',
      'app_suppliers_master',
      'app_indents',
      'app_purchase_orders',
      'app_rfqs',
      'app_quotations',
      'app_current_company',
      'app_current_user_email',
      'app_current_user_role',
      'app_current_token',
      'app_current_user_obj',
      'app_import_history',
      'app_attachments',
      'app_audit_logs',
      'app_users_master'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  React.useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', themeMode);
  }, [themeMode]);

  React.useEffect(() => {
    const activeCompany = user?.company_name || localStorage.getItem('app_current_company') || 'Organization';
    const activeEmail = user?.email || localStorage.getItem('app_current_user_email') || '';
    const activeRole = user?.role_id || localStorage.getItem('app_current_user_role') || '';
    const activeToken = token || localStorage.getItem('app_current_token') || '';

    const originalFetch = window.fetch;
    window.fetch = function (resource, config = {}) {
      config = config || {};
      config.headers = config.headers || {};

      const headersToSet = {
        'X-Company-Name': activeCompany,
        'X-User-Email': activeEmail,
        'X-User-Role': activeRole,
      };
      if (activeToken) {
        headersToSet['Authorization'] = `Bearer ${activeToken}`;
      }

      if (config.headers instanceof Headers) {
        Object.entries(headersToSet).forEach(([k, v]) => {
          if (v && !config.headers.has(k)) {
            config.headers.append(k, v);
          }
        });
      } else if (typeof config.headers === 'object') {
        Object.entries(headersToSet).forEach(([k, v]) => {
          if (v && !config.headers[k]) {
            config.headers[k] = v;
          }
        });
      }
      return originalFetch(resource, config);
    };
  }, [user, token]);

  const toggleThemeMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const switchRole = (roleId) => {
    const roleMap = {
      'role-admin': { name: 'Super Administrator', user: 'System Administrator', email: 'admin@company.com', id: 'usr-01' },
      'role-purchase': { name: 'Purchase Manager', user: 'Purchase Manager', email: 'purchase@company.com', id: 'usr-02' },
      'role-store': { name: 'Store Manager', user: 'Store Manager', email: 'store@company.com', id: 'usr-03' },
      'role-dept-mgr': { name: 'Department Manager', user: 'Department Manager', email: 'deptmgr@company.com', id: 'usr-04' },
      'role-requester': { name: 'Employee / Requester', user: 'Store Requester', email: 'requester@company.com', id: 'usr-05' },
      'role-finance': { name: 'Finance User', user: 'Finance Manager', email: 'finance@company.com', id: 'usr-06' },
      'role-auditor': { name: 'Auditor', user: 'System Auditor', email: 'auditor@company.com', id: 'usr-07' }
    };

    const target = roleMap[roleId] || roleMap['role-admin'];
    setUser({
      id: target.id,
      name: target.user,
      email: target.email,
      emp_code: `EMP-00${target.id.split('-')[1] || '1'}`,
      role: target.name,
      role_id: roleId,
      department_id: 'dept-01',
      department_name: 'Information Technology',
      permissions: rolePermissionsMap[roleId] || ['*']
    });
    setToken('active-session-token');
  };

  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.role_id === 'role-admin') return true;
    const perms = user.permissions || rolePermissionsMap[user.role_id] || [];
    return perms.includes(permissionCode) || perms.includes('*');
  };

  const login = async (email, password) => {
    // Reset any existing session state
    setUser(null);
    setToken(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return {
        success: false,
        message: 'Authentication Failed: Email address is required.'
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        message: 'Authentication Failed: Password is required.'
      };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        const prevUser = localStorage.getItem('app_current_user_email');
        const newEmail = data.user.email;
        const newCompany = data.user.company_name || 'Organization';

        if (prevUser && prevUser !== newEmail) {
          clearDomainCaches();
        }

        localStorage.setItem('app_current_user_email', newEmail);
        localStorage.setItem('app_current_company', newCompany);
        localStorage.setItem('app_current_user_role', data.user.role_id || '');
        localStorage.setItem('app_current_user_obj', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('app_current_token', data.token);
        }

        setUser({
          ...data.user,
          permissions: rolePermissionsMap[data.user.role_id] || ['*']
        });
        setToken(data.token || 'active-session-token');
        localStorage.setItem('app-active-tab', 'sec-5');
        return { success: true };
      } else {
        setUser(null);
        setToken(null);
        return { 
          success: false, 
          message: data.detail || data.message || 'Authentication Failed: Incorrect password or invalid email address.' 
        };
      }
    } catch (err) {
      console.error('Backend login request error:', err);
      setUser(null);
      setToken(null);
      return {
        success: false,
        message: 'Authentication Failed: Server connection error. Please ensure the backend server is running.'
      };
    }
  };

  const logout = () => {
    clearDomainCaches();
    setUser(null);
    setToken(null);
    localStorage.setItem('app-active-tab', 'sec-5');
  };

  const sendOTP = async (phone) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message, otp: data.otp };
      } else {
        return { success: false, message: data.detail || data.message || 'Failed to send OTP.' };
      }
    } catch (err) {
      return { success: false, message: 'Server connection error while sending OTP.' };
    }
  };

  const loginWithOTP = async (phone, otp) => {
    setUser(null);
    setToken(null);
    try {
      const res = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const prevUser = localStorage.getItem('app_current_user_email');
        const newEmail = data.user.email;
        const newCompany = data.user.company_name || 'Organization';

        if (prevUser && prevUser !== newEmail) {
          clearDomainCaches();
        }

        localStorage.setItem('app_current_user_email', newEmail);
        localStorage.setItem('app_current_company', newCompany);
        localStorage.setItem('app_current_user_role', data.user.role_id || '');
        localStorage.setItem('app_current_user_obj', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('app_current_token', data.token);
        }

        setUser({
          ...data.user,
          permissions: rolePermissionsMap[data.user.role_id] || ['*']
        });
        setToken(data.token || 'active-session-token');
        localStorage.setItem('app-active-tab', 'sec-5');
        return { success: true };
      } else {
        setUser(null);
        setToken(null);
        return { success: false, message: data.detail || data.message || 'Invalid OTP.' };
      }
    } catch (err) {
      setUser(null);
      setToken(null);
      return { success: false, message: 'Server error while verifying OTP.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      sendOTP,
      loginWithOTP,
      switchRole,
      hasPermission,
      activeWarehouse,
      setActiveWarehouse,
      notifications,
      setNotifications,
      themeMode,
      toggleThemeMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
