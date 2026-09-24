import express from 'express';
import githubService from '../services/githubService.js';

const router = express.Router();

// GET /api/github/search?q=query
router.get('/search', async (req, res) => {
  try {
    const repos = await githubService.searchRepositories(req.query.q || '');
    res.json({ success: true, count: repos.length, data: repos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/github/repo?url=owner/repo
router.get('/repo', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, error: 'Repository URL or name is required' });

    const info = await githubService.getRepoInfo(url);
    const branches = await githubService.getBranches(url);
    const commits = await githubService.getCommits(url, info.default_branch);

    res.json({
      success: true,
      data: {
        ...info,
        branches,
        commits
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/github/branches?url=owner/repo
router.get('/branches', async (req, res) => {
  try {
    const { url } = req.query;
    const branches = await githubService.getBranches(url);
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/github/commits?url=owner/repo&branch=main
router.get('/commits', async (req, res) => {
  try {
    const { url, branch = 'main' } = req.query;
    const commits = await githubService.getCommits(url, branch);
    res.json({ success: true, data: commits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
