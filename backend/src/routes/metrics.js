import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/metrics/overview
router.get('/overview', async (req, res) => {
  try {
    const projects = await db.getProjects();
    const deployments = await db.getDeployments();

    const totalProjects = projects.length;
    const totalDeployments = deployments.length;
    const successfulDeployments = deployments.filter(d => d.status === 'LIVE').length;
    const failedDeployments = deployments.filter(d => d.status === 'FAILED').length;
    const buildingDeployments = deployments.filter(d => d.status === 'BUILDING' || d.status === 'QUEUED').length;

    const completed = deployments.filter(d => d.duration_seconds > 0);
    const avgDuration = completed.length > 0
      ? Math.round(completed.reduce((acc, d) => acc + d.duration_seconds, 0) / completed.length)
      : 34;

    const successRate = totalDeployments > 0
      ? Math.round((successfulDeployments / totalDeployments) * 100)
      : 100;

    res.json({
      success: true,
      data: {
        totalProjects,
        totalDeployments,
        successfulDeployments,
        failedDeployments,
        buildingDeployments,
        avgDuration,
        successRate,
        uptimePercentage: 99.98,
        activeEdgeNodes: 48,
        bandwidthUsedGB: 124.6
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
