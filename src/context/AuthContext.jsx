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
  ]
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initial state is unauthenticated (null) so software opens on Login Page first
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeWarehouse, setActiveWarehouse] = useState('wh-01');
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Indent Submitted', message: 'Indent IND-2026-001001 requires approval', time: '10 mins ago', type: 'info', unread: true },
    { id: 2, title: 'Low Stock Warning', message: 'Dell Latitude Laptops reached reorder level (5 units left)', time: '1 hr ago', type: 'warning', unread: true },
    { id: 3, title: 'GRN Received', message: 'GRN-2026-004001 posted by Store Manager', time: '3 hrs ago', type: 'success', unread: false }
  ]);

  React.useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const switchRole = (roleId) => {
    const roleMap = {
      'role-admin': { name: 'Super Administrator', user: 'Sarah Jenkins', email: 'admin@company.com', id: 'usr-01' },
      'role-purchase': { name: 'Purchase Manager', user: 'Rajesh Kumar', email: 'purchase@company.com', id: 'usr-02' },
      'role-store': { name: 'Store Manager', user: 'Michael Chang', email: 'store@company.com', id: 'usr-03' },
      'role-dept-mgr': { name: 'Department Manager', user: 'Dr. Ananya Roy', email: 'deptmgr@company.com', id: 'usr-04' },
      'role-requester': { name: 'Employee / Requester', user: 'David Miller', email: 'requester@company.com', id: 'usr-05' },
      'role-finance': { name: 'Finance User', user: 'Priya Sharma', email: 'finance@company.com', id: 'usr-06' },
      'role-auditor': { name: 'Auditor', user: 'Robert Wilson', email: 'auditor@company.com', id: 'usr-07' }
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
    setUser(null);
    setToken(null);
    localStorage.setItem('app-active-tab', 'sec-5');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
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
