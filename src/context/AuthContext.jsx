import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default logged in admin user for seamless desktop startup
  const [user, setUser] = useState({
    id: 'usr-01',
    name: 'Sarah Jenkins',
    email: 'admin@company.com',
    emp_code: 'EMP-001',
    role: 'Super Administrator',
    role_id: 'role-admin',
    department_id: 'dept-01',
    department_name: 'Information Technology'
  });

  const [token, setToken] = useState('active-session-token');
  const [activeWarehouse, setActiveWarehouse] = useState('wh-01');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Indent Submitted', message: 'Indent IND-2026-001001 requires approval', time: '10 mins ago', type: 'info', unread: true },
    { id: 2, title: 'Low Stock Warning', message: 'Dell Latitude Laptops reached reorder level (5 units left)', time: '1 hr ago', type: 'warning', unread: true },
    { id: 3, title: 'GRN Received', message: 'GRN-2026-004001 posted by Store Manager', time: '3 hrs ago', type: 'success', unread: false }
  ]);

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
      department_name: 'Information Technology'
    });
    setToken('active-session-token');
  };

  const login = async (email, password) => {
    const roleMap = [
      { email: 'admin@company.com', name: 'Super Administrator', user: 'Sarah Jenkins', id: 'usr-01', role_id: 'role-admin' },
      { email: 'purchase@company.com', name: 'Purchase Manager', user: 'Rajesh Kumar', id: 'usr-02', role_id: 'role-purchase' },
      { email: 'store@company.com', name: 'Store Manager', user: 'Michael Chang', id: 'usr-03', role_id: 'role-store' },
      { email: 'deptmgr@company.com', name: 'Department Manager', user: 'Dr. Ananya Roy', id: 'usr-04', role_id: 'role-dept-mgr' },
      { email: 'requester@company.com', name: 'Employee / Requester', user: 'David Miller', id: 'usr-05', role_id: 'role-requester' },
      { email: 'finance@company.com', name: 'Finance User', user: 'Priya Sharma', id: 'usr-06', role_id: 'role-finance' },
      { email: 'auditor@company.com', name: 'Auditor', user: 'Robert Wilson', id: 'usr-07', role_id: 'role-auditor' }
    ];

    const found = roleMap.find(r => r.email.toLowerCase() === (email || '').toLowerCase()) || roleMap[0];
    
    setUser({
      id: found.id,
      name: found.user,
      email: email || found.email,
      emp_code: 'EMP-001',
      role: found.name,
      role_id: found.role_id,
      department_id: 'dept-01',
      department_name: 'Information Technology'
    });
    setToken('active-session-token');
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      switchRole,
      activeWarehouse,
      setActiveWarehouse,
      notifications,
      setNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
