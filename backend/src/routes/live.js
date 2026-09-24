import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUILDS_ROOT = path.join(__dirname, '../../data/builds');

// Ensure builds directory exists
if (!fs.existsSync(BUILDS_ROOT)) {
  fs.mkdirSync(BUILDS_ROOT, { recursive: true });
}

const router = express.Router();

// Helper to determine mime type
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp',
    '.txt': 'text/plain; charset=utf-8'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Generate default standalone app if none exists yet
export const generateTemplateApp = (project) => {
  const slug = project.slug;
  const projectDir = path.join(BUILDS_ROOT, slug);
  const distDir = path.join(projectDir, project.output_dir || 'dist');
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const name = project.name || 'DeployHub App';
  const framework = project.framework || 'React';
  const branch = project.branch || 'main';

  let customUiContent = '';

  if (slug.includes('nexus') || name.toLowerCase().includes('nexus') || name.toLowerCase().includes('ai')) {
    customUiContent = `
      <div class="header">
        <div class="badge"><span class="pulse"></span> LIVE ON DEPLOYHUB EDGE</div>
        <h1>🤖 Nexus AI Studio</h1>
        <p class="subtitle">Next-generation multi-model prompt engineering & inference playground</p>
      </div>

      <div class="grid">
        <div class="card">
          <h3>⚡ Model Configuration</h3>
          <div class="form-group">
            <label>Active Engine</label>
            <select id="model-select">
              <option>Gemini 1.5 Pro (Ultra-Low Latency)</option>
              <option>Gemini 1.5 Flash (1M Context)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>GPT-4o Mini</option>
            </select>
          </div>
          <div class="form-group">
            <label>Temperature (<span id="temp-val">0.7</span>)</label>
            <input type="range" min="0" max="1" step="0.1" value="0.7" id="temp-range" oninput="document.getElementById('temp-val').innerText = this.value">
          </div>
          <div class="form-group">
            <label>System Prompt</label>
            <textarea id="sys-prompt" rows="3">You are a world-class senior full-stack AI engineer. Provide concise, clean, and production-ready code.</textarea>
          </div>
        </div>

        <div class="card">
          <h3>💬 Interactive Prompt Sandbox</h3>
          <div class="form-group">
            <label>User Input Query</label>
            <textarea id="user-prompt" rows="3" placeholder="Enter your prompt here (e.g. Generate a high-performance Redis cache layer in Node.js)...">Write a robust distributed rate limiter in Node.js using Redis token bucket algorithm.</textarea>
          </div>
          <div class="actions">
            <button class="btn btn-primary" id="run-btn" onclick="runAiInference()">🚀 Run Inference</button>
            <button class="btn btn-secondary" onclick="clearOutput()">Clear</button>
          </div>
          <div class="output-box" id="ai-output">
            <div class="output-placeholder">Output stream will render here in real-time...</div>
          </div>
        </div>
      </div>
    `;
  } else if (slug.includes('solaris') || name.toLowerCase().includes('solaris') || name.toLowerCase().includes('fintech')) {
    customUiContent = `
      <div class="header">
        <div class="badge"><span class="pulse"></span> 99.999% SLA ACTIVE</div>
        <h1>💳 Solaris Fintech Core</h1>
        <p class="subtitle">Ultra-low latency microservice payment settlement gateway & ledger</p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Processed Today</div>
          <div class="stat-val">$14,892,400.00</div>
          <div class="stat-meta text-green">▲ +18.4% vs yesterday</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Settlement Latency</div>
          <div class="stat-val">14.2 ms</div>
          <div class="stat-meta text-cyan">P99 SLA Guaranteed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Nodes</div>
          <div class="stat-val">32 / 32</div>
          <div class="stat-meta text-green">All Health Checks 200 OK</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h3>⚡ Simulate Live Payment Transaction</h3>
          <div class="form-group">
            <label>Payer Account ID</label>
            <input type="text" id="payer-acc" value="acc_corp_8829104">
          </div>
          <div class="form-group">
            <label>Settlement Amount (USD)</label>
            <input type="number" id="pay-amt" value="2500.00">
          </div>
          <div class="form-group">
            <label>Target Currency</label>
            <select id="curr-select">
              <option>EUR (€) - SEPA Instant</option>
              <option>GBP (£) - Faster Payments</option>
              <option>JPY (¥) - Zengin</option>
              <option>USDC - Ethereum Layer 2</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="simulatePayment()">⚡ Settle Payment Now</button>
        </div>

        <div class="card">
          <h3>📜 Live Settlement Ledger</h3>
          <div class="ledger-box" id="ledger-stream">
            <div class="ledger-item success">
              <span>[14:02:19] TX_9921401</span>
              <span>$12,400.00 USD → EUR</span>
              <span class="tag">SETTLED (12ms)</span>
            </div>
            <div class="ledger-item success">
              <span>[14:02:15] TX_9921400</span>
              <span>$450.00 USD → GBP</span>
              <span class="tag">SETTLED (9ms)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (slug.includes('vortex') || name.toLowerCase().includes('vortex') || name.toLowerCase().includes('design')) {
    customUiContent = `
      <div class="header">
        <div class="badge"><span class="pulse"></span> VORTEX UI v3.2</div>
        <h1>🎨 Vortex Design System</h1>
        <p class="subtitle">State-of-the-art React, Tailwind & Glassmorphic UI Component Showcase</p>
      </div>

      <div class="grid">
        <div class="card">
          <h3>✨ Interactive Button Primitives</h3>
          <div class="button-showcase">
            <button class="btn btn-primary" onclick="vortexToast('Primary Neon Button Triggered')">Neon Glow</button>
            <button class="btn btn-cyan" onclick="vortexToast('Cyan Gradient Action Clicked')">Cyan Cyber</button>
            <button class="btn btn-secondary" onclick="vortexToast('Glassmorphism Button Clicked')">Glass Border</button>
            <button class="btn btn-outline" onclick="vortexToast('Ghost Outline Triggered')">Ghost Outline</button>
          </div>

          <h3 style="margin-top: 24px;">🎛️ Live Color Accent Matrix</h3>
          <div class="color-picker">
            <span class="color-dot active" style="background:#ec4899" onclick="changeTheme('#ec4899', 'Neon Pink')"></span>
            <span class="color-dot" style="background:#06b6d4" onclick="changeTheme('#06b6d4', 'Cyan')"></span>
            <span class="color-dot" style="background:#a855f7" onclick="changeTheme('#a855f7', 'Purple')"></span>
            <span class="color-dot" style="background:#10b981" onclick="changeTheme('#10b981', 'Emerald')"></span>
          </div>
        </div>

        <div class="card">
          <h3>📱 Live Preview Surface</h3>
          <div class="preview-surface" id="preview-box">
            <div class="surface-badge" id="theme-indicator">Current Accent: Neon Pink</div>
            <h4>DeployHub Dynamic Glass Card</h4>
            <p>Every style token is live and responsive. Click buttons to test dynamic UI notifications.</p>
            <div id="vortex-notifications"></div>
          </div>
        </div>
      </div>
    `;
  } else {
    customUiContent = `
      <div class="header">
        <div class="badge"><span class="pulse"></span> LIVE DEPLOYMENT</div>
        <h1>🚀 ${name}</h1>
        <p class="subtitle">Built with ${framework} • Branch: ${branch} • Hosted on DeployHub Edge</p>
      </div>

      <div class="grid">
        <div class="card">
          <h3>⚡ Real-time Environment Status</h3>
          <ul class="info-list">
            <li><strong>Framework:</strong> ${framework}</li>
            <li><strong>Branch:</strong> ${branch}</li>
            <li><strong>Deployment Status:</strong> <span class="tag-green">HTTP 200 LIVE</span></li>
            <li><strong>Edge Routing:</strong> /live/${slug}/</li>
            <li><strong>Node Version:</strong> ${project.node_version || '20.x'}</li>
          </ul>
          <button class="btn btn-primary" onclick="pingServer()">📡 Ping Health Endpoint</button>
        </div>

        <div class="card">
          <h3>🧪 Interactive Application Tester</h3>
          <p>This is your live deployed sandbox. You can interact with it, test forms, or connect remote APIs.</p>
          <div class="form-group">
            <label>Dynamic State Counter</label>
            <div class="counter-box">
              <button class="btn btn-secondary" onclick="decCount()">-</button>
              <span id="counter-val">0</span>
              <button class="btn btn-secondary" onclick="incCount()">+</button>
            </div>
          </div>
          <div class="output-box" id="ping-output">
            <div class="output-placeholder">Click 'Ping Health Endpoint' to test live edge latency...</div>
          </div>
        </div>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Deployed on DeployHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #ec4899;
      --primary-glow: rgba(236, 72, 153, 0.35);
      --bg: #09090f;
      --card-bg: rgba(18, 18, 28, 0.85);
      --border: rgba(255, 255, 255, 0.1);
      --text: #f4f4f5;
      --text-dim: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 0%, #17112b 0%, #09090f 70%);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 30px 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--border);
    }
    .brand {
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
    }
    .brand span {
      background: linear-gradient(135deg, #ec4899, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      margin-bottom: 14px;
    }
    .pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulseAnim 1.5s infinite;
    }
    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-dim);
      font-size: 15px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 24px;
      margin-bottom: 30px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      backdrop-filter: blur(16px);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .card h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 18px;
      color: #fff;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-dim);
      margin-bottom: 6px;
    }
    input[type="text"], input[type="number"], select, textarea {
      width: 100%;
      background: rgba(10, 10, 16, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 10px 12px;
      color: #fff;
      font-family: inherit;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--primary);
    }
    .btn {
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #ec4899, #d946ef);
      color: #fff;
      box-shadow: 0 0 20px var(--primary-glow);
    }
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .btn-cyan {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }
    .output-box {
      margin-top: 16px;
      background: #06060a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      min-height: 120px;
      max-height: 240px;
      overflow-y: auto;
      white-space: pre-wrap;
      color: #a5f3fc;
    }
    .output-placeholder {
      color: #52525b;
      font-style: italic;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px;
    }
    .stat-label { font-size: 12px; color: var(--text-dim); }
    .stat-val { font-size: 24px; font-weight: 800; color: #fff; margin: 4px 0; }
    .stat-meta { font-size: 11px; font-weight: 600; }
    .text-green { color: #10b981; }
    .text-cyan { color: #06b6d4; }
    .ledger-box {
      background: #06060a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 12px;
      max-height: 220px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ledger-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
    }
    .tag { background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
    .button-showcase { display: flex; flex-wrap: wrap; gap: 10px; }
    .color-picker { display: flex; gap: 10px; }
    .color-dot { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
    .color-dot.active { border-color: #fff; }
    .preview-surface {
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
    }
    .surface-badge { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--primary); margin-bottom: 8px; }
    .info-list { list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
    .tag-green { color: #10b981; font-weight: 700; }
    .counter-box { display: flex; align-items: center; gap: 16px; font-size: 20px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
    footer {
      margin-top: auto;
      text-align: center;
      font-size: 12px;
      color: #52525b;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-nav">
      <div class="brand">
        ⚡ <span>DeployHub Edge Host</span>
      </div>
      <div class="badge">
        <span class="pulse"></span> 200 OK • Node 20.x
      </div>
    </div>

    ${customUiContent}

    <footer>
      Powered by DeployHub Local Cloud Engine • Running in isolated Edge Sandbox
    </footer>
  </div>

  <script>
    let counter = 0;
    function incCount() { counter++; document.getElementById('counter-val').innerText = counter; }
    function decCount() { counter--; document.getElementById('counter-val').innerText = counter; }

    function pingServer() {
      const out = document.getElementById('ping-output');
      out.innerHTML = '<span style="color:#eab308">⚡ Pinging /api/health endpoint...</span>\\n';
      const start = Date.now();
      setTimeout(() => {
        const latency = Math.floor(Math.random() * 12) + 4;
        out.innerHTML += 'HTTP/1.1 200 OK\\n';
        out.innerHTML += 'Content-Type: application/json\\n';
        out.innerHTML += 'X-DeployHub-Edge: us-east-worker\\n';
        out.innerHTML += 'Latency: ' + latency + 'ms\\n\\n';
        out.innerHTML += JSON.stringify({ status: "healthy", uptime: 1429.2, framework: "${framework}" }, null, 2);
      }, 300);
    }

    function runAiInference() {
      const out = document.getElementById('ai-output');
      const btn = document.getElementById('run-btn');
      const prompt = document.getElementById('user-prompt').value;
      const model = document.getElementById('model-select').value;
      
      btn.disabled = true;
      btn.innerText = '⚡ Streaming...';
      out.innerHTML = '<span style="color:#ec4899">[' + model + '] Streaming response tokens:</span>\\n\\n';

      const responseText = "// Distributed Token Bucket Rate Limiter in Node.js & Redis\\nimport Redis from 'ioredis';\\nconst redis = new Redis(process.env.REDIS_URL);\\n\\nexport async function rateLimit(key, limit = 100, windowSecs = 60) {\\n  const current = await redis.incr(key);\\n  if (current === 1) {\\n    await redis.expire(key, windowSecs);\\n  }\\n  return { allowed: current <= limit, current, limit };\\n}";
      
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < responseText.length) {
          out.innerHTML += responseText.charAt(idx);
          idx++;
        } else {
          clearInterval(interval);
          btn.disabled = false;
          btn.innerText = '🚀 Run Inference';
        }
      }, 15);
    }

    function clearOutput() {
      document.getElementById('ai-output').innerHTML = '<div class="output-placeholder">Output stream cleared. Ready for next prompt.</div>';
    }

    function simulatePayment() {
      const amt = document.getElementById('pay-amt').value;
      const curr = document.getElementById('curr-select').value.split(' ')[0];
      const stream = document.getElementById('ledger-stream');
      const txId = 'TX_' + Math.floor(Math.random() * 899999 + 100000);
      const latency = Math.floor(Math.random() * 8) + 6;

      const item = document.createElement('div');
      item.className = 'ledger-item success';
      item.innerHTML = '<span>[' + new Date().toTimeString().split(' ')[0] + '] ' + txId + '</span><span>$' + amt + ' USD → ' + curr + '</span><span class="tag">SETTLED (' + latency + 'ms)</span>';
      stream.insertBefore(item, stream.firstChild);
    }

    function changeTheme(color, name) {
      document.documentElement.style.setProperty('--primary', color);
      document.getElementById('theme-indicator').innerText = 'Current Accent: ' + name;
      document.getElementById('theme-indicator').style.color = color;
    }

    function vortexToast(msg) {
      const container = document.getElementById('vortex-notifications');
      if (!container) return;
      const div = document.createElement('div');
      div.style.cssText = 'background:rgba(236,72,153,0.15); border:1px solid #ec4899; color:#f472b6; padding:8px 12px; border-radius:8px; font-size:12px; margin-top:8px;';
      div.innerText = '✨ ' + msg;
      container.appendChild(div);
      setTimeout(() => div.remove(), 2500);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf-8');
  return distDir;
};

// Mount route for /live/:slug and /live/:slug/*
router.use('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  // Find project
  const project = await db.getProjectById(slug);
  const projectBuildDir = path.join(BUILDS_ROOT, slug);

  // Check if build directory exists, if not generate it
  if (!fs.existsSync(projectBuildDir) || !fs.existsSync(path.join(projectBuildDir, 'dist', 'index.html'))) {
    generateTemplateApp(project || { slug, name: slug, framework: 'React' });
  }

  // Determine serve path
  const candidates = [
    path.join(projectBuildDir, project?.output_dir || 'dist'),
    path.join(projectBuildDir, 'dist'),
    path.join(projectBuildDir, 'build'),
    path.join(projectBuildDir, 'out'),
    path.join(projectBuildDir, 'public'),
    projectBuildDir
  ];

  let serveDir = candidates.find(dir => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) || candidates[0];

  // Get relative request path within the app
  let subPath = req.path;
  if (!subPath || subPath === '/') subPath = '/index.html';

  let targetFile = path.join(serveDir, subPath);

  // Fallback to index.html for Single Page Applications
  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(serveDir, 'index.html');
  }

  if (fs.existsSync(targetFile)) {
    const mime = getMimeType(targetFile);
    res.setHeader('Content-Type', mime);
    res.setHeader('X-DeployHub-Live', 'true');
    res.setHeader('X-Frame-Options', 'ALLOWALL'); // Allow embedding in DeployHub preview iframe
    
    // If it's an HTML file, inject base tag or serve
    if (mime.startsWith('text/html')) {
      let content = fs.readFileSync(targetFile, 'utf-8');
      return res.send(content);
    }

    return res.sendFile(targetFile);
  }

  res.status(404).send(`404: App asset not found for ${slug}`);
});

export default router;
