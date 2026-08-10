import { initSqliteSchema } from './sqlite.js';
import { loadDb } from './database.js';

console.log('===================================================');
console.log(' Enterprise Inventory Database Initialization');
console.log('===================================================');

// 1. Initialize SQLite Database Tables (PDF Section 3 & 36)
initSqliteSchema();

// 2. Initialize Persistent JSON File Store
loadDb();

console.log('[Database Engine] Database tables, constraints, indexes & seeds initialized successfully!');
