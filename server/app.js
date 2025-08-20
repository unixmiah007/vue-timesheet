import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import timesheetRoutes from './routes/timesheets.js';
import uploadRoutes from './routes/upload.js';
import { initDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// initialize DB and tables
await initDb();

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Timesheet API running' });
});

app.use('/api', authRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/upload', uploadRoutes);

// Static serving for uploaded files (optional)
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
