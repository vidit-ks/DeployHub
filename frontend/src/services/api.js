import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // Projects
  async getProjects() {
    const res = await apiClient.get('/projects');
    return res.data.data;
  },

  async getProject(id) {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data.data;
  },

  async createProject(projectData) {
    const res = await apiClient.post('/projects', projectData);
    return res.data;
  },

  async updateProject(id, updates) {
    const res = await apiClient.put(`/projects/${id}`, updates);
    return res.data.data;
  },

  async deleteProject(id) {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  },

  async deployProject(id, options = {}) {
    const res = await apiClient.post(`/projects/${id}/deploy`, options);
    return res.data;
  },

  // Environment Variables
  async getProjectEnv(projectId) {
    const res = await apiClient.get(`/projects/${projectId}/env`);
    return res.data.data;
  },

  async setProjectEnv(projectId, envData) {
    const res = await apiClient.post(`/projects/${projectId}/env`, envData);
    return res.data.data;
  },

  async deleteProjectEnv(projectId, envId) {
    const res = await apiClient.delete(`/projects/${projectId}/env/${envId}`);
    return res.data;
  },

  // Deployments
  async getDeployments(filter = {}) {
    const params = new URLSearchParams();
    if (filter.projectId) params.append('projectId', filter.projectId);
    if (filter.status) params.append('status', filter.status);
    const res = await apiClient.get(`/deployments?${params.toString()}`);
    return res.data.data;
  },

  async getDeployment(id) {
    const res = await apiClient.get(`/deployments/${id}`);
    return res.data.data;
  },

  async getDeploymentLogs(id) {
    const res = await apiClient.get(`/deployments/${id}/logs`);
    return res.data.data;
  },

  async redeploy(id, options = {}) {
    const res = await apiClient.post(`/deployments/${id}/redeploy`, options);
    return res.data;
  },

  async rollback(id) {
    const res = await apiClient.post(`/deployments/${id}/rollback`);
    return res.data;
  },

  // Live SSE stream helper
  connectLogStream(deploymentId, { onLog, onStatus, onError }) {
    const streamUrl = `${API_BASE}/deployments/${deploymentId}/stream`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onLog) onLog(data);
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.addEventListener('status', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onStatus) onStatus(data);
      } catch (err) {
        console.error('Failed to parse SSE status:', err);
      }
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },

  // GitHub
  async searchGithubRepos(query = '') {
    const res = await apiClient.get(`/github/search?q=${encodeURIComponent(query)}`);
    return res.data.data;
  },

  async getGithubRepo(url) {
    const res = await apiClient.get(`/github/repo?url=${encodeURIComponent(url)}`);
    return res.data.data;
  },

  async getGithubBranches(url) {
    const res = await apiClient.get(`/github/branches?url=${encodeURIComponent(url)}`);
    return res.data.data;
  },

  async getGithubCommits(url, branch = 'main') {
    const res = await apiClient.get(`/github/commits?url=${encodeURIComponent(url)}&branch=${encodeURIComponent(branch)}`);
    return res.data.data;
  },

  // Gemini AI Error Doctor
  async explainError(payload) {
    const res = await apiClient.post('/ai/explain-error', payload);
    return res.data.data;
  },

  // Metrics
  async getMetricsOverview() {
    const res = await apiClient.get('/metrics/overview');
    return res.data.data;
  }
};

export default api;
