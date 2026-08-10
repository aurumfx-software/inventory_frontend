import express from 'express';
import { db, saveDb } from '../db/database.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.is_active);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email credentials or inactive user.' });
  }

  // Simple demo password check (allows password123 or matches stored)
  if (password !== user.password && password !== 'password123') {
    return res.status(401).json({ success: false, message: 'Invalid password.' });
  }

  const role = db.roles.find(r => r.id === user.role_id) || {};
  const department = db.departments.find(d => d.id === user.department_id) || {};

  // Log audit
  db.audit_logs.unshift({
    id: `aud-${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    action: 'USER_LOGIN',
    module: 'AUTH',
    record_id: user.id,
    details: `User ${user.name} logged in successfully`,
    timestamp: new Date().toISOString(),
    ip_address: '127.0.0.1'
  });
  saveDb();

  return res.json({
    success: true,
    message: 'Login successful',
    token: `demo-jwt-token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emp_code: user.emp_code,
      role: role.name,
      role_id: user.role_id,
      department_id: user.department_id,
      department_name: department.name,
      branch_id: user.branch_id
    }
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  
  const userId = token.split('-')[3] || 'usr-01';
  const user = db.users.find(u => u.id === userId) || db.users[0];
  const role = db.roles.find(r => r.id === user.role_id) || {};

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emp_code: user.emp_code,
      role: role.name,
      role_id: user.role_id,
      department_id: user.department_id
    }
  });
});

export default router;
