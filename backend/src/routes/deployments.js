import express from 'express';
import db from '../config/db.js';
import deploymentEngine from '../services/deploymentEngine.js';

const router = express.Router();

// GET /api/deployments
router.get('/', async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const deployments = await db.getDeployments({ projectId, status });

    // Join with project info
    const projects = await db.getProjects();
    const projectMap = new Map(projects.map(p => [p.id, p]));

    const enriched = deployments.map(d => ({
      ...d,
      project: projectMap.get(d.project_id) || { name: 'Unknown Project', slug: 'unknown' }
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deployments/:id
router.get('/:id', async (req, res) => {
  try {
    const deployment = await db.getDeploymentById(req.params.id);
    if (!deployment) {
      return res.status(404).json({ success: false, error: 'Deployment not found' });
    }

    const project = await db.getProjectById(deployment.project_id);
    const logs = await db.getLogs(deployment.id);

    res.json({
      success: true,
      data: {
        ...deployment,
        project,
        logs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deployments/:id/logs
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await db.getLogs(req.params.id);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deployments/:id/stream - Server Sent Events for live logs
router.get('/:id/stream', async (req, res) => {
  const deploymentId = req.params.id;
  const deployment = await db.getDeploymentById(deploymentId);

  if (!deployment) {
    return res.status(404).json({ success: false, error: 'Deployment not found' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send existing logs first
  const existingLogs = await db.getLogs(deploymentId);
  for (const log of existingLogs) {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  }

  // Send current status
  res.write(`event: status\ndata: ${JSON.stringify({ status: deployment.status })}\n\n`);

  // Subscribe to live events
  deploymentEngine.subscribeClient(deploymentId, res);
});

// POST /api/deployments/:id/redeploy
router.post('/:id/redeploy', async (req, res) => {
  try {
    const existing = await db.getDeploymentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deployment not found' });
    }

    const { simulateFailure } = req.body || {};

    const newDeployment = await db.createDeployment({
      project_id: existing.project_id,
      branch: existing.branch,
      commit_sha: existing.commit_sha,
      commit_message: `Redeploy of #${existing.deployment_number}: ${existing.commit_message}`,
      commit_author: 'Developer',
      trigger: 'redeploy'
    });

    setTimeout(() => {
      deploymentEngine.startDeployment(newDeployment.id, { simulateFailure });
    }, 200);

    res.status(201).json({
      success: true,
      message: 'Redeployment started',
      data: newDeployment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/deployments/:id/rollback
router.post('/:id/rollback', async (req, res) => {
  try {
    const target = await db.getDeploymentById(req.params.id);
    if (!target) return res.status(404).json({ success: false, error: 'Target deployment not found' });
    if (target.status !== 'LIVE') {
      return res.status(400).json({ success: false, error: 'Can only rollback to previously LIVE deployments' });
    }

    const project = await db.getProjectById(target.project_id);

    const rollbackDep = await db.createDeployment({
      project_id: target.project_id,
      branch: target.branch,
      commit_sha: target.commit_sha,
      commit_message: `Rollback to #${target.deployment_number} (${target.commit_sha})`,
      commit_author: 'Rollback System',
      trigger: 'rollback'
    });

    setTimeout(() => {
      deploymentEngine.startDeployment(rollbackDep.id);
    }, 200);

    res.status(201).json({
      success: true,
      message: `Rollback to deployment #${target.deployment_number} initiated`,
      data: rollbackDep
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
