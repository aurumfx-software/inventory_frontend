import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.js';
import masterRoutes from './routes/masters.js';
import indentRoutes from './routes/indents.js';
import approvalRoutes from './routes/approvals.js';
import procurementRoutes from './routes/procurement.js';
import inventoryOpsRoutes from './routes/inventoryOps.js';
import reportRoutes from './routes/reports.js';
import settingsAuditRoutes from './routes/settingsAudit.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', masterRoutes);
app.use('/api/indents', indentRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api', procurementRoutes);
app.use('/api', inventoryOpsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', settingsAuditRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'UP', message: 'Inventory & Procurement Desktop API Server Running' });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Inventory & Procurement API Server running on port ${PORT}`);
  console.log(`===================================================`);
});
