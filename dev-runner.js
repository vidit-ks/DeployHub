import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting DeployHub Full-Stack Platform...');

const backend = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

const frontend = spawn('npx', ['vite', '--host'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_API_URL: 'http://localhost:5000/api' }
});

const cleanup = () => {
  console.log('\n🛑 Shutting down DeployHub processes...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
