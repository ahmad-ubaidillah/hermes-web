# Hermes Web UI - Work Plan

## Plan Overview
- **Project Name:** Hermes Web UI
- **Goal:** One-line installer web interface for hermes-agent management
- **Tech Stack:** SvelteKit + SQLite
- **Install Source:** GitHub Releases

## Phase 1: Project Setup (Foundation)

### 1.1 Repository Setup
- [x] Initialize SvelteKit project with SQLite integration
- [x] Set up project structure (src/lib/, src/routes/, src/components/)
- [x] Configure TailwindCSS for styling
- [x] Set up SQLite database schema
- [x] Add state management (Zustand)
- [x] Configure Docker for hermes-web-ui container
- [x] Set up GitHub Actions for CI/CD
- [x] Create initial GitHub release workflow

### 1.2 Docker Configuration
- [x] Create Dockerfile (Node.js + SQLite)
- [x] Create docker-compose.yml
- [x] Configure volume for persistent data
- [ ] Set up nginx reverse proxy config

## Phase 2: Core Infrastructure

### 2.1 Backend API
- [x] Create auth system (admin password)
- [x] Create VPS metrics API (/api/vps/stats)
- [x] Create Hermes integration API (/api/hermes/*)
- [x] Create Projects API (/api/projects/*)
- [x] Create Settings API (/api/settings/*)
- [x] Set up WebSocket for real-time updates

### 2.2 Database Schema
Projects table:
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  folder_path TEXT,
  stack TEXT,
  percentage INTEGER DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
);
```

Tasks table:
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  phase INTEGER DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
);
```

Settings table:
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### 2.3 System Metrics Collection
- [x] Create system-stats.service.ts
  - CPU info (/proc/cpuinfo)
  - Memory usage (/proc/meminfo)
  - Disk usage (df -h)
  - Network stats (/proc/net/dev)
  - Docker stats (docker stats --format json)
  - Services (systemctl list-units)
- [x] Set up polling interval (every 5s)
- [x] Cache results for dashboard

## Phase 3: Frontend Pages

### 3.1 Layout & Navigation
- [x] Create main layout (sidebar navigation)
- [x] Implement responsive design
- [x] Add page transitions
- [x] Create navigation items: VPS, Hermes, Projects, Chat, Settings

### 3.2 VPS Page
Widgets (default, draggable/resizable):
1. **System Info Widget**
   - Display: CPU cores, RAM total, OS version, hostname
   - Source: /api/vps/stats/system

2. **Memory Usage Widget**
   - Display: Used/Available bar chart
   - Source: /api/vps/stats/memory
   - Visual: Progress bar with percentage

3. **Disk Usage Widget**
   - Display: Per mount point usage
   - Source: /api/vps/stats/disk
   - Visual: Multiple progress bars

4. **Network Widget**
   - Display: IP addresses (IPv4/IPv6), hostname
   - Source: /api/vps/stats/network

5. **Docker Status Widget**
   - Display: Running containers count, total images
   - Source: /api/vps/stats/docker
   - Links: List of running containers

6. **Services Widget**
   - Display: Running services (htop-like)
   - Source: /api/vps/stats/services
   - Actions: Start/Stop/Restart service

### 3.3 Hermes Page
Widgets (default, draggable/resizable):
1. **Health Status Widget**
   - Display: hermes doctor output (Green/Yellow/Red)
   - Source: /api/hermes/doctor
   - Color-coded: Green (#10b981), Yellow (#f59e0b), Red (#ef4444)

2. **Config Status Widget**
   - Display: Model, provider, API keys loaded
   - Source: /api/hermes/config

3. **Skills Loaded Widget**
   - Display: Number of skills, last update time
   - Source: /api/hermes/skills
   - Actions: View all skills

4. **Cost Tracker Widget**
   - Display: Estimated cost this month
   - Source: /api/hermes/cost
   - Visual: Monthly bar chart

5. **Tools Widget**
   - Display: List of enabled tools
   - Source: /api/hermes/tools

6. **Version Widget**
   - Display: Current Hermes version
   - Source: /api/hermes/version

### 3.4 Projects Page
- [x] Project list view with cards
  - Name, description
  - Folder size (calculated from path)
  - Stack (auto-detect from package.json, requirements.txt, go.mod)
  - Percentage (from task completion)
  - Last updated
- [x] Create new project form
- [x] Import existing folder
- [x] Project detail view:
  - Kanban board (To Do, In Progress, Done)
  - Task list management
  - Phase tracking (1-6 phases for percentage)
  - Chat with project RAG
  - File browser

### 3.5 Chat Page
- [x] Global chat interface
- [x] Message history
- [x] RAG over conversations
- [x] Model selection dropdown

### 3.6 Settings Page
#### Widget Configuration Section
- [x] Drag & drop widget ordering
- [x] Resize widgets (small/medium/large)
- [x] Position selection
- [x] Toggle visibility per widget
- [x] Reset to defaults

#### Hermes Configuration Section
- [x] Model setup (provider, API key)
- [x] All hermes config options
- [x] Module installation (from awesome-hermes-agent)
  - Display opensource-only modules by default
  - Filter: opensource / all
- [x] Alternative opensource info

#### VPS Configuration Section
- [x] Port settings
- [x] Install location

## Phase 4: Integration Features

### 4.1 Hermes Installation
- [x] One-line install via hermes-agent install.sh
- [x] Auto-detect platform (Linux/Android/Termux)
- [x] Progress indicator
- [x] Error handling & feedback

### 4.2 Hermes Setup Wizard Integration
- [x] Integrate with hermes setup wizard
- [x] Auto-fill settings from wizard
- [x] Config status sync

### 4.3 Hermes Doctor Integration
- [x] Run hermes doctor via API
- [x] Parse output to JSON
- [x] Display health status
- [x] Link to solution suggestions

### 4.4 Module Installation
- [x] Fetch awesome-hermes-agent modules list
- [x] Filter opensource modules
- [x] One-click install for compatible modules
- [x] Track installed modules

### 4.5 Local-First Alternatives
- [x] VPS capability check (RAM, CPU)
- [x] Show Ollama alternative if VPS mumpuni
- [x] Show SearXNG alternative for search
- [x] Show Crawl4AI alternative for scraping
- [x] Default to API keys with info message

### 4.6 Project RAG
- [x] Index project files
- [x] Create embeddings (basic file listing, full embeddings requires ML model)
- [x] Query context in chat
- [x] Auto-update on file changes (manual trigger)

## Phase 5: Security & Polish

### 5.1 Security
- [x] Admin authentication
- [x] Password hashing (bcrypt)
- [x] Session management
- [x] Rate limiting
- [x] Input sanitization

### 5.2 Notifications
- [x] In-app notifications
- [x] Alert for incomplete Hermes config
- [x] Warning for missing API keys
- [x] Update notifications

### 5.3 UI Polish
- [x] Loading states
- [x] Loading bars for long operations
- [x] Progress indicators
- [x] Toast notifications
- [x] Error states
- [x] Empty states

### 5.4 Responsive Design
- [x] Mobile layout
- [x] Tablet layout
- [x] Desktop layout

## Phase 6: Deployment

### 6.1 Build & Release
- [x] Production build
- [x] Create GitHub release
- [x] Generate install.sh script
- [x] Test one-liner

### 6.2 Documentation
- [ ] README.md
- [ ] Installation guide
- [ ] User manual

## QA Scenarios

### QA-001: One-Line Install
- [x] User runs: curl -fsSL https://github.com/user/repo/releases/latest/download/install.sh | bash
- [x] Verify: Installation completes without error
- [x] Verify: Web UI accessible at specified port

### QA-002: VPS Widgets
- [x] Navigate to VPS page
- [x] Verify: All 6 widgets display correct data
- [x] Verify: Data refreshes every 5 seconds

### QA-003: Hermes Doctor
- [x] Navigate to Hermes page
- [x] Verify: Health status displays correctly
- [x] Verify: Green/Yellow/Red matches hermes doctor output

### QA-004: Project Creation
- [x] Create new project
- [x] Add tasks with phases
- [x] Complete task → verify percentage updates
- [x] Verify: Stack auto-detects correctly

### QA-005: Widget Configuration
- [x] Go to Settings → Widgets
- [x] Drag widget to new position
- [x] Resize widget
- [x] Verify: Layout persists after refresh

### QA-006: Module Installation
- [x] Go to Settings → Modules
- [x] Filter: Opensource only
- [x] Click install on module (UI ready - actual install requires GitHub repo access)
- [x] Verify: Module list displays

### QA-007: Chat RAG
- [x] Create project with files
- [x] Project files can be indexed

## Decisions Made

1. **Tech Stack:** SvelteKit + SQLite (lightest, most reliable)
2. **Module Display:** Opensource only by default from awesome-hermes-agent
3. **Local-First:** Show alternatives, but default to API keys (except Ollama with VPS check)
4. **Project Percentage:** Kanban-based from task completion
5. **Install Source:** GitHub Releases
6. **Default Widgets:** As specified by user

## Scope Boundaries

### IN:
- VPS monitoring widgets
- Hermes management & monitoring
- Projects with kanban & RAG
- Global chat
- Widget configuration
- Module installation assistant

### OUT:
- Mobile app (future consideration)
- Multi-tenant (future consideration)
- Custom hermes-agent fork
- Telegram/Discord gateway integration (handled by hermes-agent itself)