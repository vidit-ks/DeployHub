import express from 'express';
import aiService from '../services/aiService.js';
import db from '../config/db.js';

const router = express.Router();

// POST /api/ai/explain-error
router.post('/explain-error', async (req, res) => {
  try {
    const { deploymentId, errorMessage, logs, framework, buildCommand, apiKey } = req.body;

    let targetError = errorMessage;
    let targetLogs = logs;
    let targetFramework = framework || 'React';
    let targetBuildCmd = buildCommand || 'npm run build';

    // If deploymentId is given, fetch logs directly from database
    if (deploymentId) {
      const deployment = await db.getDeploymentById(deploymentId);
      if (deployment) {
        targetError = targetError || deployment.error_message;
        const project = await db.getProjectById(deployment.project_id);
        if (project) {
          targetFramework = project.framework || targetFramework;
          targetBuildCmd = project.build_command || targetBuildCmd;
        }
        const dbLogs = await db.getLogs(deploymentId);
        targetLogs = targetLogs || dbLogs;
      }
    }

    const explanation = await aiService.explainError({
      errorMessage: targetError,
      logs: targetLogs,
      framework: targetFramework,
      buildCommand: targetBuildCmd,
      userApiKey: apiKey
    });

    res.json({
      success: true,
      data: explanation
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
