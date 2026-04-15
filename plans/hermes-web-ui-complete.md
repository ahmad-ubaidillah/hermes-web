# Hermes Web UI - Complete Project Reference

> Document Created: April 15, 2026
> Status: Planning Complete - Ready for Execution

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Page Structure](#3-page-structure)
4. [Widgets Reference](#4-widgets-reference)
5. [Module Integration](#5-module-integration)
6. [Project Concept](#6-project-concept)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Installation](#9-installation)
10. [Task List](#10-task-list)
11. [QA Scenarios](#11-qa-scenarios)
12. [Decisions & Defaults](#12-decisions--defaults)

---

## 1. Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | Hermes Web UI |
| **Goal** | One-line installer web interface for hermes-agent management |
| **Target Users** | Non-technical users who want easy hermes installation & management |
| **Install Source** | GitHub Releases |
| **One-Liner** | `curl -fsSL https://github.com/[USER]/hermes-web-ui/releases/latest/download/install.sh \| bash` |

---

## 2. Tech Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| **Framework** | SvelteKit | Lightest, most reliable |
| **Database** | SQLite | Simple, file-based, no setup |
| **Styling** | TailwindCSS | Utility-first, fast |
| **State** | Zustand | Light, simple |
| **Docker** | Node.js + SQLite image | Full-stack JS |
| **Reverse Proxy** | nginx | Production-ready |

### Alternative Options Considered

| Option | Rejected Because |
|--------|---------------|
| Next.js + SQLite | Heavier resource usage |
| Go + HTMX | Less familiar ecosystem |
| Bun + Vue 3 | SvelteKit is more stable |

---

## 3. Page Structure

### Pages (5 Total)

| Page | Route | Description |
|------|-------|------------|
| **Dashboard** | `/` | Welcome message, quick stats |
| **VPS** | `/vps` | System monitoring widgets |
| **Hermes** | `/hermes` | Hermes status & management |
| **Projects** | `/projects` | Project list with kanban |
| **Chat** | `/chat` | Global chat (not project-specific) |
| **Settings** | `/settings` | Widget config, hermes config, VPS config |

### Navigation

```
┌─────────────────────────────────────┐
│  🏠 Home                          │
│  ├─ Dashboard                     │
│  ├─ VPS                         │
│  ├─ Hermes                      │
│  ├─ Projects                   │
│  ├─ Chat                       │
│  └─ Settings                   │
└─────────────────────────────────────┘
```

---

## 4. Widgets Reference

### 4.1 VPS Widgets (Default)

| Widget | Data Source | Visual | Refresh |
|--------|------------|--------|---------|
| **System Info** | /proc/cpuinfo, /proc/meminfo | Text stats | 60s |
| **Memory Usage** | /proc/meminfo | Progress bar | 5s |
| **Disk Usage** | df -h | Multiple bars | 60s |
| **Network** | /proc/net/dev | IP list | 60s |
| **Docker Status** | docker stats --format json | Container list | 5s |
| **Services** | systemctl list-units | htop-like | 10s |

### 4.2 Hermes Widgets (Default)

| Widget | Data Source | Visual | Refresh |
|--------|------------|--------|---------|
| **Health Status** | hermes doctor | Color indicator | Manual |
| **Config Status** | ~/.hermes/config.yaml | Key-value list | 30s |
| **Skills Loaded** | hermes skills list | Count + list | 60s |
| **Cost Tracker** | API usage logs | Bar chart | Daily |
| **Tools** | hermes tools list | Toggle list | 60s |
| **Version** | hermes --version | Text | Manual |

### 4.3 Widget Configuration

| Feature | Description |
|---------|-------------|
| **Drag & Drop** | Reorder widgets via drag |
| **Resize** | Small (1x), Medium (2x), Large (3x) |
| **Position** | Left, Center, Right columns |
| **Toggle** | Show/hide per widget |
| **Reset** | Return to defaults |

---

## 5. Module Integration

### 5.1 Awesome Hermes Agent Modules

Source: https://github.com/0xNyk/awesome-hermes-agent

#### Included Categories (Opensource Only)

| Category | Modules | API Key Required |
|----------|---------|----------------|
| **Skills** | wondelai/skills, cybersecurity-skills, chainlink | ❌ |
| **Tools** | hermes-workspace, mission-control | ❌ |
| **Deployment** | hermes-docker, nix-hermes | ❌ |
| **Memory** | hindsight (self-hosted), honcho | ⚠️ Docker |
| **Scraping** | firecrawl (self-hosted), crawl4ai | ⚠️ Docker |

#### Module Display Rules

1. **Default filter:** Opensource only
2. **Badge:** Show "🔓 Opensource" label
3. **Installation:** One-click install button
4. **Status:** Track installed modules

### 5.2 Local-First Alternatives

| Original | Alternative | VPS Check | Default |
|----------|------------|-----------|---------|
| OpenAI API | Ollama | RAM >= 8GB, CPU >= 4 cores | ❌ API Key |
| Serper/Exa | SearXNG | Docker available | ❌ API Key |
| Firecrawl | Crawl4AI | Docker available | ❌ API Key |

> **Note:** Default to API keys unless user explicitly enables opensource alternatives. Show info message about alternatives in settings.

---

## 6. Project Concept

### 6.1 Project Structure

```
Project
├── name: string
├── description: string
├── folder_path: string (nullable)
├── stack: string[] (auto-detect)
├── percentage: number (0-100)
├── tasks: Task[]
└── kanban: KanbanBoard
```

### 6.2 Task & Kanban

| Field | Type | Description |
|-------|------|-------------|
| **id** | UUID | Unique identifier |
| **project_id** | UUID | Foreign key |
| **title** | string | Task title |
| **status** | enum | "todo", "in_progress", "done" |
| **phase** | number | 1-6 (for percentage) |
| **created_at** | datetime | Creation timestamp |
| **updated_at** | datetime | Last update |

### 6.3 Percentage Calculation

```
percentage = (completed_Phases / total_Phases) × 100

Where completed_Phases = MAX(phase) that has all tasks done
```

Example:
- 6 phases total
- Phase 3 has tasks in progress
- Percentage = 50% (3/6)

### 6.4 Stack Detection

| Language | File to Check | Output Example |
|----------|--------------|----------------|
| JavaScript/React | package.json | ["react", "express"] |
| Python | requirements.txt, pyproject.toml | ["python", "fastapi"] |
| Go | go.mod | ["go", "gin"] |
| Rust | Cargo.toml | ["rust", "actix"] |
| PHP | composer.json | ["php", "laravel"] |
| Java | pom.xml, build.gradle | ["java", "spring"] |

### 6.5 Project RAG

| Feature | Implementation |
|---------|--------------|
| **Indexing** | Scan project files on creation |
| **Embeddings** | Use same model as chat |
| **Query** | Include project context in chat |
| **Auto-update** | Re-index on file changes |

---

## 7. Database Schema

### 7.1 Projects Table

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  folder_path TEXT,
  stack TEXT, -- JSON array stored as string
  percentage INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 Tasks Table

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  phase INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 7.3 Settings Table

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### 7.4 Installed Modules Table

```sql
CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  installed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. API Endpoints

### 8.1 VPS Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/vps/stats/system | CPU, RAM, OS info |
| GET | /api/vps/stats/memory | Memory usage |
| GET | /api/vps/stats/disk | Disk usage |
| GET | /api/vps/stats/network | Network stats |
| GET | /api/vps/stats/docker | Docker containers |
| GET | /api/vps/stats/services | System services |

### 8.2 Hermes Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/hermes/doctor | Run hermes doctor |
| GET | /api/hermes/config | Current config |
| GET | /api/hermes/skills | List skills |
| GET | /api/hermes/tools | List tools |
| GET | /api/hermes/version | Version info |
| GET | /api/hermes/install | Run install script |
| POST | /api/hermes/setup | Run setup wizard |

### 8.3 Projects Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/projects | List all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project detail |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/projects/:id/tasks | Get project tasks |
| POST | /api/projects/:id/tasks | Create task |
| PUT | /api/projects/:id/tasks/:taskId | Update task |

### 8.4 Settings Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/settings | Get all settings |
| PUT | /api/settings/:key | Update setting |
| GET | /api/settings/widgets | Widget layout |
| PUT | /api/settings/widgets | Save widget layout |

---

## 9. Installation

### 9.1 One-Line Install

```bash
curl -fsSL https://github.com/[USER]/hermes-web-ui/releases/latest/download/install.sh | bash
```

### 9.2 Install Questions

| Question | Default | Options |
|----------|---------|---------|
| Install location | /opt/hermes-web-ui | Custom path |
| Port | 3000 | Any available port |
| Admin password | (prompt) | Secure password |

### 9.3 Post-Install

```
1. Run hermes-agent one-liner
2. Run hermes setup wizard
3. Configure default widgets
4. Ready to use
```

---

## 10. Task List

### Phase 1: Project Setup (7 tasks)

- [ ] Initialize SvelteKit project
- [ ] Set up project structure
- [ ] Configure TailwindCSS
- [ ] Set up SQLite database
- [ ] Add Zustand state
- [ ] Create Docker config
- [ ] Set up CI/CD

### Phase 2: Core Infrastructure (12 tasks)

- [ ] Create auth system
- [ ] Create VPS API
- [ ] Create Hermes API
- [ ] Create Projects API
- [ ] Create Settings API
- [ ] Set up WebSocket
- [ ] Create database schema
- [ ] System stats service
- [ ] Metrics polling
- [ ] Result caching
- [ ] Error handling
- [ ] Logging
- [ ] Validation

### Phase 3: Frontend Pages (35 tasks)

#### 3.1 Layout & Navigation
- [ ] Main layout
- [ ] Sidebar navigation
- [ ] Responsive design
- [ ] Page transitions

#### 3.2 VPS Page
- [ ] System info widget
- [ ] Memory widget
- [ ] Disk widget
- [ ] Network widget
- [ ] Docker widget
- [ ] Services widget

#### 3.3 Hermes Page
- [ ] Health widget
- [ ] Config widget
- [ ] Skills widget
- [ ] Cost widget
- [ ] Tools widget
- [ ] Version widget

#### 3.4 Projects Page
- [ ] Project list
- [ ] Create form
- [ ] Import folder
- [ ] Kanban board
- [ ] Task management
- [ ] Project chat

#### 3.5 Chat Page
- [ ] Chat interface
- [ ] Message history
- [ ] RAG integration

#### 3.6 Settings Page
- [ ] Widget config
- [ ] Hermes config
- [ ] Module installer
- [ ] VPS config

### Phase 4: Integration (15 tasks)

- [ ] Hermès install flow
- [ ] Setup wizard sync
- [ ] Doctor integration
- [ ] Module fetch
- [ ] Module install
- [ ] VPS capability check
- [ ] Ollama setup
- [ ] SearXNG setup
- [ ] Project indexing
- [ ] RAG query
- [ ] Context injection
- [ ] Notification system
- [ ] Alert system
- [ ] Update checker

### Phase 5: Security & Polish (10 tasks)

- [ ] Admin auth
- [ ] Password hashing
- [ ] Session management
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Loading states
- [ ] Progress bars
- [ ] Toast notifications
- [ ] Error states
- [ ] Responsive layout

### Phase 6: Deployment (5 tasks)

- [ ] Production build
- [ ] GitHub release
- [ ] Install script
- [ ] Test one-liner
- [ ] Documentation

---

## 11. QA Scenarios

### QA-001: One-Line Install
```
1. User runs curl command
2. Installation starts
3. Questions prompted
4. Installation completes
5. Web UI accessible
```

### QA-002: VPS Widgets
```
1. Navigate to VPS page
2. Verify 6 widgets visible
3. Verify data accurate
4. Verify auto-refresh
```

### QA-003: Hermes Health
```
1. Navigate to Hermes page
2. Run hermes doctor
3. Verify status color
4. Verify explanation
```

### QA-004: Project Creation
```
1. Click "New Project"
2. Enter name, description
3. Add tasks with phases
4. Verify percentage
5. Verify stack detection
```

### QA-005: Kanban Board
```
1. Create project
2. Add 6 tasks (phase 1-6)
3. Move task to "done"
4. Verify percentage = 17%
5. Move all phase 1 done = 17%
```

### QA-006: Widget Config
```
1. Go to Settings
2. Drag widget
3. Resize widget
4. Hide widget
5. Reset
```

### QA-007: Module Install
```
1. Go to Settings → Modules
2. Filter opensource
3. Click install
4. Verify success
```

### QA-008: Project Chat
```
1. Create project with files
2. Ask question about files
3. Verify context used
4. Verify no OOT
```

---

## 12. Decisions & Defaults

### Decisions Made

| Decision | Value | Rationale |
|----------|-------|----------|
| **Tech Stack** | SvelteKit + SQLite | Lightest, reliable |
| **Module Display** | Opensource only | No API key needed |
| **Local-First** | Optional with VPS check | Depends on capability |
| **Percentage** | Kanban-based | User requirement |
| **Install Source** | GitHub Releases | User specified |

### Defaults Applied

| Item | Default |
|------|--------|
| **VPS Widgets** | All 6 enabled |
| **Hermes Widgets** | All 6 enabled |
| **Module Filter** | Opensource only |
| **Port** | 3000 |
| **Install Location** | /opt/hermes-web-ui |
| **Memory Threshold** | 8GB for Ollama |
| **CPU Threshold** | 4 cores for Ollama |

### Scope

| In Scope | Out of Scope |
|---------|-------------|
| VPS monitoring | Mobile app |
| Hermes management | Multi-tenant |
| Project kanban | Custom hermes fork |
| Chat with RAG | Gateway integration |
| Widget config | Billing |
| Module installer | Team features |

---

## File Structure

```
hermes-web-ui/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   ├── server/
│   │   └── stores/
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── vps/
│   │   ├── hermes/
│   │   ├── projects/
│   │   ├── chat/
│   │   └── settings/
│   └── app.html
├── static/
│   └── install.sh
├── docker-compose.yml
├── Dockerfile
├── svelte.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## Next Steps

1. **GitHub Repository:**
   - Create repository
   - Initial commit with plan

2. **Setup CI/CD:**
   - GitHub Actions workflow
   - Release automation

3. **Execute Tasks:**
   - Start with Phase 1

---

*Document Reference: `.sisyphus/plans/hermes-web-ui.md`*
*Draft Reference: `.sisyphus/drafts/hermes-web-ui-planning.md`*