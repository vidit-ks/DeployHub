import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/deployhub_store.json');

// Initialize data directory
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default Seed Data for immediate WOW experience
const INITIAL_DATA = {
  projects: [
    {
      id: 'proj_nexus_ai',
      name: 'Nexus AI Studio',
      slug: 'nexus-ai-studio',
      description: 'Next-generation AI prompt engineering and playground interface',
      repo_url: 'https://github.com/developer/nexus-ai-studio',
      repo_name: 'developer/nexus-ai-studio',
      branch: 'main',
      framework: 'Next.js',
      build_command: 'npm run build',
      start_command: 'npm start',
      output_dir: '.next',
      root_dir: '/',
      node_version: '20.x',
      current_status: 'LIVE',
      live_url: 'https://nexus-ai-studio.deployhub.app',
      deploy_count: 14,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      id: 'proj_solaris_pay',
      name: 'Solaris Fintech Core',
      slug: 'solaris-fintech-core',
      description: 'Ultra-low latency microservice payment settlement gateway',
      repo_url: 'https://github.com/developer/solaris-fintech-core',
      repo_name: 'developer/solaris-fintech-core',
      branch: 'main',
      framework: 'Node.js',
      build_command: 'npm run build:prod',
      start_command: 'node dist/server.js',
      output_dir: 'dist',
      root_dir: '/',
      node_version: '20.x',
      current_status: 'LIVE',
      live_url: 'https://solaris-fintech.deployhub.app',
      deploy_count: 28,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
      id: 'proj_vortex_ui',
      name: 'Vortex Design System',
      slug: 'vortex-design-system',
      description: 'Comprehensive React & Tailwind component library for SaaS',
      repo_url: 'https://github.com/developer/vortex-ui',
      repo_name: 'developer/vortex-ui',
      branch: 'develop',
      framework: 'React',
      build_command: 'npm run build',
      start_command: 'npm run preview',
      output_dir: 'dist',
      root_dir: '/',
      node_version: '20.x',
      current_status: 'FAILED',
      live_url: 'https://vortex-ui.deployhub.app',
      deploy_count: 9,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: 'proj_hyperion_api',
      name: 'Hyperion Vector Engine',
      slug: 'hyperion-vector-engine',
      description: 'Distributed similarity search indexing engine in Rust & Python',
      repo_url: 'https://github.com/developer/hyperion-vector',
      repo_name: 'developer/hyperion-vector',
      branch: 'main',
      framework: 'Python',
      build_command: 'pip install -r requirements.txt',
      start_command: 'uvicorn main:app --host 0.0.0.0 --port 8000',
      output_dir: '.',
      root_dir: '/',
      node_version: '3.11',
      current_status: 'LIVE',
      live_url: 'https://hyperion-vector.deployhub.app',
      deploy_count: 6,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 360).toISOString()
    }
  ],
  deployments: [
    {
      id: 'dep_42_nexus',
      project_id: 'proj_nexus_ai',
      deployment_number: 42,
      commit_sha: 'a81f32c',
      commit_message: 'feat: add streaming tokens support & latency charts',
      commit_author: 'Alex Chen',
      branch: 'main',
      status: 'LIVE',
      trigger: 'github_push',
      duration_seconds: 32,
      started_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 24.5).toISOString(),
      live_url: 'https://nexus-ai-studio.deployhub.app',
      error_message: null,
      error_details: null
    },
    {
      id: 'dep_41_vortex',
      project_id: 'proj_vortex_ui',
      deployment_number: 9,
      commit_sha: 'e92bc41',
      commit_message: 'fix: glassmorphism backdrop blur opacity filter',
      commit_author: 'Sarah Jenkins',
      branch: 'develop',
      status: 'FAILED',
      trigger: 'manual',
      duration_seconds: 18,
      started_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 14.7).toISOString(),
      live_url: null,
      error_message: "Module not found: Can't resolve '@radix-ui/react-tooltip' in '/app/src/components/Tooltip.tsx'",
      error_details: {
        errorType: "ModuleResolutionError",
        missingModule: "@radix-ui/react-tooltip",
        file: "/app/src/components/Tooltip.tsx",
        line: 4,
        exitCode: 1
      }
    },
    {
      id: 'dep_40_solaris',
      project_id: 'proj_solaris_pay',
      deployment_number: 28,
      commit_sha: '3f81aa2',
      commit_message: 'perf: optimize redis caching layer and transaction locks',
      commit_author: 'Marcus Vance',
      branch: 'main',
      status: 'LIVE',
      trigger: 'github_push',
      duration_seconds: 45,
      started_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 119.25).toISOString(),
      live_url: 'https://solaris-fintech.deployhub.app',
      error_message: null,
      error_details: null
    },
    {
      id: 'dep_39_hyperion',
      project_id: 'proj_hyperion_api',
      deployment_number: 6,
      commit_sha: '71d440b',
      commit_message: 'feat: add cosine similarity metric endpoint',
      commit_author: 'Alex Chen',
      branch: 'main',
      status: 'LIVE',
      trigger: 'manual',
      duration_seconds: 52,
      started_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 359).toISOString(),
      live_url: 'https://hyperion-vector.deployhub.app',
      error_message: null,
      error_details: null
    }
  ],
  deployment_logs: [
    {
      id: 1,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      log_level: 'system',
      stage: 'clone',
      message: 'DeployHub Engine v2.4 initialized. Worker node: us-east-worker-04'
    },
    {
      id: 2,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 1000).toISOString(),
      log_level: 'command',
      stage: 'clone',
      message: '$ git clone https://github.com/developer/nexus-ai-studio.git --branch main --depth 1'
    },
    {
      id: 3,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 3000).toISOString(),
      log_level: 'info',
      stage: 'clone',
      message: 'Cloned revision a81f32c (commit: "feat: add streaming tokens support")'
    },
    {
      id: 4,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 4000).toISOString(),
      log_level: 'command',
      stage: 'install',
      message: '$ npm install --prefer-offline --no-audit'
    },
    {
      id: 5,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 11000).toISOString(),
      log_level: 'info',
      stage: 'install',
      message: 'added 428 packages in 6.84s (cache hit rate 94.2%)'
    },
    {
      id: 6,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 12000).toISOString(),
      log_level: 'command',
      stage: 'build',
      message: '$ npm run build'
    },
    {
      id: 7,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 15000).toISOString(),
      log_level: 'info',
      stage: 'build',
      message: '▲ Next.js 14.2.5 - compiling static & dynamic routes...'
    },
    {
      id: 8,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 24000).toISOString(),
      log_level: 'info',
      stage: 'build',
      message: '✓ Generating static pages (14/14) [100% in 3.4s]'
    },
    {
      id: 9,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 26000).toISOString(),
      log_level: 'system',
      stage: 'containerize',
      message: 'Building isolated OCI container artifact...'
    },
    {
      id: 10,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 29000).toISOString(),
      log_level: 'system',
      stage: 'health_check',
      message: 'Starting container on internal port 3000... Ping HTTP GET /api/health -> 200 OK (8ms)'
    },
    {
      id: 11,
      deployment_id: 'dep_42_nexus',
      timestamp: new Date(Date.now() - 1000 * 60 * 25 + 32000).toISOString(),
      log_level: 'system',
      stage: 'health_check',
      message: '✨ Production deployment live: https://nexus-ai-studio.deployhub.app'
    },
    // Vortex Failed Logs
    {
      id: 20,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      log_level: 'system',
      stage: 'clone',
      message: 'DeployHub Engine v2.4 initialized. Worker node: us-west-worker-02'
    },
    {
      id: 21,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15 + 1000).toISOString(),
      log_level: 'command',
      stage: 'clone',
      message: '$ git clone https://github.com/developer/vortex-ui.git --branch develop --depth 1'
    },
    {
      id: 22,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15 + 3000).toISOString(),
      log_level: 'command',
      stage: 'install',
      message: '$ npm install'
    },
    {
      id: 23,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15 + 8000).toISOString(),
      log_level: 'command',
      stage: 'build',
      message: '$ npm run build'
    },
    {
      id: 24,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15 + 11000).toISOString(),
      log_level: 'info',
      stage: 'build',
      message: 'vite v5.3.4 building for production...'
    },
    {
      id: 25,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15 + 15000).toISOString(),
      log_level: 'error',
      stage: 'build',
      message: "error during build:\n[vite:load-fallback] Could not resolve '@radix-ui/react-tooltip' from 'src/components/Tooltip.tsx'\nfile: /app/src/components/Tooltip.tsx:4:31\n  2 | import React from 'react';\n  3 | import { cn } from '../utils';\n> 4 | import * as TooltipPrimitive from '@radix-ui/react-tooltip';\n    |                                    ^\n  5 | export const Tooltip = TooltipPrimitive.Root;"
    },
    {
      id: 26,
      deployment_id: 'dep_41_vortex',
      timestamp: new Date(Date.now() - 1000 * 60 * 15 + 18000).toISOString(),
      log_level: 'error',
      stage: 'build',
      message: 'FATAL: Build exited with code 1. Deployment aborted.'
    }
  ],
  environment_variables: [
    {
      id: 'env_1',
      project_id: 'proj_nexus_ai',
      key: 'DATABASE_URL',
      value: 'postgres://nexus_admin:supersecret@db.cloud.deployhub:5432/nexus_prod',
      environment: 'production',
      is_secret: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'env_2',
      project_id: 'proj_nexus_ai',
      key: 'NEXT_PUBLIC_API_URL',
      value: 'https://nexus-ai-studio.deployhub.app/api',
      environment: 'production',
      is_secret: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'env_3',
      project_id: 'proj_nexus_ai',
      key: 'OPENAI_API_KEY',
      value: 'sk-proj-99214710123984019230912',
      environment: 'production',
      is_secret: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'env_4',
      project_id: 'proj_solaris_pay',
      key: 'STRIPE_WEBHOOK_SECRET',
      value: 'whsec_9918239012489012',
      environment: 'production',
      is_secret: true,
      created_at: new Date().toISOString()
    }
  ]
};

// Database storage layer
class Database {
  constructor() {
    this.usePostgres = false;
    this.pool = null;
    this.data = this.loadData();
    this.initPostgres();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing json store, using initial seed:', err.message);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData(data = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write data store:', err.message);
    }
  }

  async initPostgres() {
    if (process.env.DATABASE_URL || (process.env.PGUSER && process.env.PGDATABASE)) {
      try {
        this.pool = new pg.Pool({
          connectionString: process.env.DATABASE_URL || undefined,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432', 10),
          database: process.env.PGDATABASE,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        await this.pool.query('SELECT NOW()');
        this.usePostgres = true;
        console.log('✓ Connected to PostgreSQL database successfully.');
      } catch (err) {
        console.warn('PostgreSQL connection not active. Running on high-performance local persistent store:', err.message);
        this.usePostgres = false;
      }
    } else {
      console.log('Running DeployHub on built-in persistent storage (PostgreSQL ready via DATABASE_URL).');
    }
  }

  // Projects CRUD
  async getProjects() {
    return this.data.projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  async getProjectById(idOrSlug) {
    return this.data.projects.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  async createProject(project) {
    const newProject = {
      id: project.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: project.name,
      slug: project.slug || project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: project.description || '',
      repo_url: project.repo_url,
      repo_name: project.repo_name || project.repo_url.replace(/https?:\/\/github\.com\//, ''),
      branch: project.branch || 'main',
      framework: project.framework || 'React',
      build_command: project.build_command || 'npm run build',
      start_command: project.start_command || 'npm start',
      output_dir: project.output_dir || 'dist',
      root_dir: project.root_dir || '/',
      node_version: project.node_version || '20.x',
      current_status: 'QUEUED',
      live_url: `https://${(project.slug || project.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.deployhub.app`,
      deploy_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.projects.unshift(newProject);
    this.saveData();
    return newProject;
  }

  async updateProject(id, updates) {
    const idx = this.data.projects.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveData();
    return this.data.projects[idx];
  }

  async deleteProject(id) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.projects.splice(idx, 1);
    this.data.deployments = this.data.deployments.filter(d => d.project_id !== id);
    this.data.environment_variables = this.data.environment_variables.filter(e => e.project_id !== id);
    this.saveData();
    return true;
  }

  // Deployments CRUD
  async getDeployments(filter = {}) {
    let list = [...this.data.deployments];
    if (filter.projectId) {
      list = list.filter(d => d.project_id === filter.projectId);
    }
    if (filter.status) {
      list = list.filter(d => d.status.toUpperCase() === filter.status.toUpperCase());
    }
    return list.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  }

  async getDeploymentById(id) {
    return this.data.deployments.find(d => d.id === id) || null;
  }

  async createDeployment(dep) {
    const project = await this.getProjectById(dep.project_id);
    const count = (project ? project.deploy_count : 0) + 1;

    const newDep = {
      id: dep.id || `dep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: dep.project_id,
      deployment_number: count,
      commit_sha: dep.commit_sha || Math.random().toString(16).substring(2, 9),
      commit_message: dep.commit_message || 'Manual deployment trigger',
      commit_author: dep.commit_author || 'Developer',
      branch: dep.branch || (project ? project.branch : 'main'),
      status: dep.status || 'BUILDING',
      trigger: dep.trigger || 'manual',
      duration_seconds: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      live_url: project ? project.live_url : null,
      error_message: null,
      error_details: null
    };

    if (project) {
      await this.updateProject(project.id, {
        deploy_count: count,
        current_status: newDep.status
      });
    }

    this.data.deployments.unshift(newDep);
    this.saveData();
    return newDep;
  }

  async updateDeployment(id, updates) {
    const idx = this.data.deployments.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.deployments[idx] = {
      ...this.data.deployments[idx],
      ...updates
    };
    this.saveData();
    return this.data.deployments[idx];
  }

  // Logs
  async getLogs(deploymentId) {
    return this.data.deployment_logs
      .filter(l => l.deployment_id === deploymentId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async addLog(deploymentId, { log_level = 'info', stage = 'build', message }) {
    const log = {
      id: (this.data.deployment_logs.length || 0) + 1,
      deployment_id: deploymentId,
      timestamp: new Date().toISOString(),
      log_level,
      stage,
      message
    };
    this.data.deployment_logs.push(log);
    this.saveData();
    return log;
  }

  async clearLogs(deploymentId) {
    this.data.deployment_logs = this.data.deployment_logs.filter(l => l.deployment_id !== deploymentId);
    this.saveData();
  }

  // Environment Variables
  async getEnvVars(projectId) {
    return this.data.environment_variables.filter(e => e.project_id === projectId);
  }

  async setEnvVar(projectId, { key, value, environment = 'production', is_secret = true }) {
    const existingIdx = this.data.environment_variables.findIndex(
      e => e.project_id === projectId && e.key === key && e.environment === environment
    );
    const item = {
      id: existingIdx !== -1 ? this.data.environment_variables[existingIdx].id : `env_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      key,
      value,
      environment,
      is_secret,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      this.data.environment_variables[existingIdx] = item;
    } else {
      this.data.environment_variables.push(item);
    }
    this.saveData();
    return item;
  }

  async deleteEnvVar(projectId, envId) {
    const initialLen = this.data.environment_variables.length;
    this.data.environment_variables = this.data.environment_variables.filter(
      e => !(e.project_id === projectId && (e.id === envId || e.key === envId))
    );
    this.saveData();
    return this.data.environment_variables.length < initialLen;
  }
}

export const db = new Database();
export default db;
