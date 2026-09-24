import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects.js';
import deploymentsRouter from './routes/deployments.js';
import githubRouter from './routes/github.js';
import aiRouter from './routes/ai.js';
import metricsRouter from './routes/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json());

// Request logger for API calls
app.use((req, res, next) => {
  if (!req.path.includes('/stream')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/github', githubRouter);
app.use('/api/ai', aiRouter);
app.use('/api/metrics', metricsRouter);

// Base Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    platform: 'DeployHub Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 DeployHub Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Ready to deploy applications, stream logs, and diagnose with Gemini AI.`);
});
