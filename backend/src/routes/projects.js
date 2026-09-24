import express from 'express';
import db from '../config/db.js';
import deploymentEngine from '../services/deploymentEngine.js';

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const deployments = await db.getDeployments({ projectId: project.id });
    const envVars = await db.getEnvVars(project.id);

    res.json({
      success: true,
      data: {
        ...project,
        deployments,
        envVars
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const {
      name,
      repo_url,
      repo_name,
      branch = 'main',
      framework = 'React',
      build_command = 'npm run build',
      start_command = 'npm start',
      output_dir = 'dist',
      root_dir = '/',
      node_version = '20.x',
      env_vars = [],
      trigger_initial_deploy = true
    } = req.body;

    if (!name || !repo_url) {
      return res.status(400).json({ success: false, error: 'Project name and repository URL are required' });
    }

    const project = await db.createProject({
      name,
      repo_url,
      repo_name,
      branch,
      framework,
      build_command,
      start_command,
      output_dir,
      root_dir,
      node_version
    });

    // Save environment variables if provided
    if (Array.isArray(env_vars)) {
      for (const env of env_vars) {
        if (env.key && env.value) {
          await db.setEnvVar(project.id, env);
        }
      }
    }

    // Trigger initial deployment automatically if requested
    let initialDeployment = null;
    if (trigger_initial_deploy) {
      initialDeployment = await db.createDeployment({
        project_id: project.id,
        branch: project.branch,
        commit_sha: Math.random().toString(16).substring(2, 9),
        commit_message: 'Initial repository deployment',
        commit_author: 'DeployHub Wizard',
        trigger: 'manual'
      });

      // Start asynchronous build pipeline
      setTimeout(() => {
        deploymentEngine.startDeployment(initialDeployment.id);
      }, 300);
    }

    res.status(201).json({
      success: true,
      data: project,
      initialDeployment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/projects/:id/deploy
router.post('/:id/deploy', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const { branch, commit_message, simulateFailure } = req.body || {};

    const deployment = await db.createDeployment({
      project_id: project.id,
      branch: branch || project.branch || 'main',
      commit_sha: Math.random().toString(16).substring(2, 9),
      commit_message: commit_message || 'Manual trigger deployment',
      commit_author: 'Developer',
      trigger: 'manual'
    });

    // Run pipeline
    setTimeout(() => {
      deploymentEngine.startDeployment(deployment.id, { simulateFailure });
    }, 200);

    res.status(201).json({
      success: true,
      message: 'Deployment triggered successfully',
      data: deployment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/projects/:id/env
router.get('/:id/env', async (req, res) => {
  try {
    const envVars = await db.getEnvVars(req.params.id);
    res.json({ success: true, data: envVars });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/projects/:id/env
router.post('/:id/env', async (req, res) => {
  try {
    const { key, value, environment = 'production', is_secret = true } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'Variable key is required' });
    const item = await db.setEnvVar(req.params.id, { key, value, environment, is_secret });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/projects/:id/env/:envId
router.delete('/:id/env/:envId', async (req, res) => {
  try {
    const deleted = await db.deleteEnvVar(req.params.id, req.params.envId);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
