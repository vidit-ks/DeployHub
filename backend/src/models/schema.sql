-- DeployHub PostgreSQL Schema

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    repo_url VARCHAR(500) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) DEFAULT 'main',
    framework VARCHAR(50) DEFAULT 'react',
    build_command VARCHAR(255) DEFAULT 'npm run build',
    start_command VARCHAR(255) DEFAULT 'npm start',
    output_dir VARCHAR(100) DEFAULT 'dist',
    root_dir VARCHAR(100) DEFAULT '/',
    node_version VARCHAR(20) DEFAULT '20.x',
    current_status VARCHAR(50) DEFAULT 'LIVE',
    live_url VARCHAR(500),
    deploy_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    deployment_number INT NOT NULL,
    commit_sha VARCHAR(40) NOT NULL,
    commit_message TEXT NOT NULL,
    commit_author VARCHAR(100) DEFAULT 'Developer',
    branch VARCHAR(100) DEFAULT 'main',
    status VARCHAR(50) NOT NULL, -- 'LIVE', 'BUILDING', 'FAILED', 'QUEUED', 'CANCELLED'
    trigger VARCHAR(50) DEFAULT 'manual', -- 'manual', 'github_push', 'redeploy', 'rollback'
    duration_seconds INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    live_url VARCHAR(500),
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployment_logs (
    id SERIAL PRIMARY KEY,
    deployment_id VARCHAR(64) REFERENCES deployments(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    log_level VARCHAR(20) DEFAULT 'info', -- 'info', 'warn', 'error', 'system', 'command'
    stage VARCHAR(50), -- 'clone', 'install', 'build', 'containerize', 'health_check'
    message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS environment_variables (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    environment VARCHAR(50) DEFAULT 'production', -- 'production', 'preview', 'development'
    is_secret BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, key, environment)
);

CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    is_private BOOLEAN DEFAULT FALSE,
    language VARCHAR(50),
    stars INT DEFAULT 0,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
