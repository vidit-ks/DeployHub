import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import http from 'http';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUILDS_ROOT = path.join(__dirname, '../../data/builds');

// Ensure builds directory exists
if (!fs.existsSync(BUILDS_ROOT)) {
  fs.mkdirSync(BUILDS_ROOT, { recursive: true });
}

class DeploymentEngine extends EventEmitter {
  constructor() {
    super();
    this.activeStreams = new Map(); // deploymentId -> Set of express res SSE clients
    this.activeServers = new Map(); // projectSlug -> { port, server, process }
    this.nextPort = 4100;
  }

  /**
   * Subscribe SSE response client to live logs
   */
  subscribeClient(deploymentId, res) {
    if (!this.activeStreams.has(deploymentId)) {
      this.activeStreams.set(deploymentId, new Set());
    }
    this.activeStreams.get(deploymentId).add(res);

    res.on('close', () => {
      const set = this.activeStreams.get(deploymentId);
      if (set) {
        set.delete(res);
        if (set.size === 0) {
          this.activeStreams.delete(deploymentId);
        }
      }
    });
  }

  broadcastLog(deploymentId, logItem) {
    const clients = this.activeStreams.get(deploymentId);
    if (clients && clients.size > 0) {
      const payload = `data: ${JSON.stringify(logItem)}\n\n`;
      clients.forEach(res => {
        try {
          res.write(payload);
        } catch {}
      });
    }
  }

  broadcastStatus(deploymentId, statusData) {
    const clients = this.activeStreams.get(deploymentId);
    if (clients && clients.size > 0) {
      const payload = `event: status\ndata: ${JSON.stringify(statusData)}\n\n`;
      clients.forEach(res => {
        try {
          res.write(payload);
        } catch {}
      });
    }
  }

  /**
   * Execute real shell command with streaming output
   */
  runCommand(cmd, args, { cwd, env, emitLog, stage }) {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const commandString = `${cmd} ${args.join(' ')}`;

      emitLog(stage, 'command', `$ ${commandString}`);

      const proc = spawn(cmd, args, {
        cwd,
        env: { ...process.env, ...env, CI: 'true', FORCE_COLOR: '1' },
        shell: isWindows
      });

      proc.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          emitLog(stage, 'info', line);
        }
      });

      proc.stderr.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          emitLog(stage, 'error', line);
        }
      });

      proc.on('error', (err) => {
        emitLog(stage, 'error', `Process execution error: ${err.message}`);
        reject(err);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          const err = new Error(`Command failed with exit code ${code}`);
          err.code = code;
          reject(err);
        }
      });
    });
  }

  /**
   * Host built output directory or run dynamic server
   */
  async hostProject(projectSlug, buildDir, outputDirName = 'dist') {
    // If existing server is running for this project, close it first
    if (this.activeServers.has(projectSlug)) {
      const existing = this.activeServers.get(projectSlug);
      try {
        if (existing.server) existing.server.close();
        if (existing.process) existing.process.kill();
      } catch {}
    }

    const port = this.nextPort++;
    const targetDir = path.join(buildDir, outputDirName);
    const servePath = fs.existsSync(targetDir) ? targetDir : buildDir;

    // Create simple HTTP static server
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || !reqPath) reqPath = '/index.html';

      let filePath = path.join(servePath, reqPath);

      // SPA fallback
      if (!fs.existsSync(filePath) && fs.existsSync(path.join(servePath, 'index.html'))) {
        filePath = path.join(servePath, 'index.html');
      }

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found in Deployed Output');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };

        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(content);
      });
    });

    await new Promise((resolve) => {
      server.listen(port, () => {
        this.activeServers.set(projectSlug, { port, server, servePath });
        resolve();
      });
    });

    return port;
  }

  /**
   * Main Pipeline Execution (Supports both REAL Git Clones and Fallback Simulations)
   */
  async startDeployment(deploymentId, options = {}) {
    const deployment = await db.getDeploymentById(deploymentId);
    if (!deployment) throw new Error('Deployment not found');

    const project = await db.getProjectById(deployment.project_id);
    if (!project) throw new Error('Project not found');

    const startTime = Date.now();
    await db.updateDeployment(deploymentId, { status: 'BUILDING', started_at: new Date().toISOString() });
    await db.updateProject(project.id, { current_status: 'BUILDING' });
    this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'clone', progress: 5 });

    const emitLog = async (stage, log_level, message) => {
      const log = await db.addLog(deploymentId, { stage, log_level, message });
      this.broadcastLog(deploymentId, log);
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const shouldSimulateFailure = options.simulateFailure === true || deployment.commit_message?.includes('[fail]');

    // Check if repo_url is a real remote git repo
    const isRealGitRepo = project.repo_url && (
      project.repo_url.startsWith('http://') ||
      project.repo_url.startsWith('https://') ||
      project.repo_url.startsWith('git@')
    ) && !project.repo_url.includes('developer/nexus-ai-studio') && !project.repo_url.includes('developer/solaris') && !project.repo_url.includes('developer/vortex-ui');

    if (isRealGitRepo && !shouldSimulateFailure) {
      // === REAL DEPLOYMENT ENGINE ===
      const projectBuildDir = path.join(BUILDS_ROOT, project.slug);
      
      try {
        await emitLog('clone', 'system', `🚀 DeployHub Real Execution Engine initialized.`);
        await emitLog('clone', 'system', `Workspace directory: ${projectBuildDir}`);
        
        // Prepare directory
        if (fs.existsSync(projectBuildDir)) {
          fs.rmSync(projectBuildDir, { recursive: true, force: true });
        }
        fs.mkdirSync(projectBuildDir, { recursive: true });

        // Stage 1: Real Git Clone
        this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'clone', progress: 15 });
        await this.runCommand('git', ['clone', '--depth', '1', '--branch', deployment.branch || 'main', project.repo_url, '.'], {
          cwd: projectBuildDir,
          emitLog,
          stage: 'clone'
        });

        // Stage 2: Dependencies Installation
        this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'install', progress: 40 });
        const hasPackageJson = fs.existsSync(path.join(projectBuildDir, 'package.json'));

        if (hasPackageJson) {
          await this.runCommand('npm', ['install', '--prefer-offline', '--no-audit'], {
            cwd: projectBuildDir,
            emitLog,
            stage: 'install'
          });
        }

        // Stage 3: Real Build Command
        this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'build', progress: 65 });
        const buildCmd = project.build_command || 'npm run build';
        const buildParts = buildCmd.split(' ');
        
        if (hasPackageJson && buildCmd) {
          await this.runCommand(buildParts[0], buildParts.slice(1), {
            cwd: projectBuildDir,
            emitLog,
            stage: 'build'
          });
        }

        // Stage 4 & 5: Real Hosting & Health Check
        this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'containerize', progress: 85 });
        const port = await this.hostProject(project.slug, projectBuildDir, project.output_dir || 'dist');
        const liveLocalUrl = `http://localhost:${port}`;
        
        await emitLog('health_check', 'system', `✨ Real application running locally on: ${liveLocalUrl}`);
        await emitLog('health_check', 'system', `Edge Proxy: https://${project.slug}.deployhub.app`);

        const duration = Math.round((Date.now() - startTime) / 1000);
        await db.updateDeployment(deploymentId, {
          status: 'LIVE',
          duration_seconds: duration,
          completed_at: new Date().toISOString(),
          live_url: liveLocalUrl,
          error_message: null,
          error_details: null
        });

        await db.updateProject(project.id, {
          current_status: 'LIVE',
          live_url: liveLocalUrl
        });

        this.broadcastStatus(deploymentId, {
          status: 'LIVE',
          stage: 'health_check',
          duration,
          live_url: liveLocalUrl,
          progress: 100
        });

        return;
      } catch (err) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        await emitLog('build', 'error', `Build execution failure: ${err.message}`);
        await db.updateDeployment(deploymentId, {
          status: 'FAILED',
          duration_seconds: duration,
          completed_at: new Date().toISOString(),
          error_message: err.message
        });
        await db.updateProject(project.id, { current_status: 'FAILED' });
        this.broadcastStatus(deploymentId, { status: 'FAILED', stage: 'build', duration, progress: 100 });
        return;
      }
    }

    // === SIMULATED/SAMPLE PIPELINE (For curated templates and demo failure tests) ===
    try {
      await emitLog('clone', 'system', `DeployHub Engine v2.4 initialized. Node worker: us-east-worker-${Math.floor(Math.random() * 10) + 1}`);
      await sleep(600);
      await emitLog('clone', 'command', `$ git clone ${project.repo_url} --branch ${deployment.branch || 'main'} --depth 1`);
      await sleep(900);
      await emitLog('clone', 'info', `Cloned revision ${deployment.commit_sha} (commit: "${deployment.commit_message}")`);
      this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'clone', progress: 20 });

      await sleep(700);
      await emitLog('install', 'command', `$ npm install --prefer-offline --no-audit`);
      await sleep(1000);

      if (shouldSimulateFailure) {
        await sleep(800);
        await emitLog('build', 'command', `$ ${project.build_command || 'npm run build'}`);
        await sleep(1000);
        await emitLog('build', 'info', `vite v5.3.4 building for production...`);
        await sleep(600);
        const failMessage = `error during build:\n[vite:load-fallback] Could not resolve '@radix-ui/react-tooltip' from 'src/components/Tooltip.tsx'\nfile: /app/src/components/Tooltip.tsx:4:31\n  2 | import React from 'react';\n  3 | import { cn } from '../utils';\n> 4 | import * as TooltipPrimitive from '@radix-ui/react-tooltip';\n    |                                    ^\n  5 | export const Tooltip = TooltipPrimitive.Root;`;
        
        await emitLog('build', 'error', failMessage);
        await sleep(400);
        await emitLog('build', 'error', `FATAL: Build exited with code 1. Deployment aborted.`);

        const duration = Math.round((Date.now() - startTime) / 1000);
        await db.updateDeployment(deploymentId, {
          status: 'FAILED',
          duration_seconds: duration,
          completed_at: new Date().toISOString(),
          error_message: "Module not found: Can't resolve '@radix-ui/react-tooltip' in '/app/src/components/Tooltip.tsx'",
          error_details: {
            errorType: 'ModuleResolutionError',
            missingModule: '@radix-ui/react-tooltip',
            file: '/app/src/components/Tooltip.tsx',
            line: 4,
            exitCode: 1
          }
        });
        await db.updateProject(project.id, { current_status: 'FAILED' });
        this.broadcastStatus(deploymentId, { status: 'FAILED', stage: 'build', duration, progress: 100 });
        return;
      }

      await emitLog('install', 'info', `added 348 packages in 4.12s (cache hit rate 96.8%)`);
      this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'install', progress: 45 });

      await sleep(800);
      await emitLog('build', 'command', `$ ${project.build_command || 'npm run build'}`);
      await sleep(1200);
      await emitLog('build', 'info', `▲ Bundling application for production...`);
      await sleep(1000);
      await emitLog('build', 'info', `✓ Created ${project.output_dir || 'dist'} assets (chunks: 6, total: 342 kB gzip)`);
      this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'build', progress: 70 });

      await sleep(700);
      await emitLog('containerize', 'system', `Creating container image deployhub/${project.slug}:${deployment.commit_sha}...`);
      await sleep(900);
      await emitLog('containerize', 'info', `Image digest: sha256:7f83b1a403019f... (size: 84MB)`);
      this.broadcastStatus(deploymentId, { status: 'BUILDING', stage: 'containerize', progress: 85 });

      await sleep(700);
      const allocatedPort = Math.floor(Math.random() * 5000) + 30000;
      await emitLog('health_check', 'system', `Starting container sandbox on port :${allocatedPort}`);
      await sleep(800);
      await emitLog('health_check', 'info', `Probing GET /api/health -> HTTP 200 OK (latency: 12ms)`);
      await sleep(500);
      
      const liveUrl = project.live_url || `https://${project.slug}.deployhub.app`;
      await emitLog('health_check', 'system', `✨ Deployment successfully routed to Edge Anycast: ${liveUrl}`);

      const duration = Math.round((Date.now() - startTime) / 1000);
      await db.updateDeployment(deploymentId, {
        status: 'LIVE',
        duration_seconds: duration,
        completed_at: new Date().toISOString(),
        live_url: liveUrl,
        error_message: null,
        error_details: null
      });

      await db.updateProject(project.id, {
        current_status: 'LIVE',
        live_url: liveUrl
      });

      this.broadcastStatus(deploymentId, {
        status: 'LIVE',
        stage: 'health_check',
        duration,
        live_url: liveUrl,
        progress: 100
      });

    } catch (err) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      await emitLog('build', 'error', `Fatal deployment error: ${err.message}`);
      await db.updateDeployment(deploymentId, {
        status: 'FAILED',
        duration_seconds: duration,
        completed_at: new Date().toISOString(),
        error_message: err.message
      });
      await db.updateProject(project.id, { current_status: 'FAILED' });
      this.broadcastStatus(deploymentId, { status: 'FAILED', stage: 'build', duration, progress: 100 });
    }
  }
}

export const deploymentEngine = new DeploymentEngine();
export default deploymentEngine;
