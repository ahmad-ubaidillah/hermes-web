# Hermes Web UI - Planning Draft

## Project Overview
- **Name:** Hermes Web UI
- **Goal:** One-line installer web interface for hermes-agent
- **Target:** Easy hermes installation and management for non-technical users

## Page Structure

### 1. Dashboard (Home)
- Welcome message
- Quick stats: Hermes status, active projects, recent activity

### 2. VPS Page (Default Widgets)
| Widget | Description |
|--------|-------------|
| System Info | CPU cores, RAM, OS version |
| Memory Usage | Used/Available bar |
| Disk Usage | Per mount point |
| Network | IP, bandwidth |
| Docker Status | Running containers, images |
| Services | Running services (like htop) |

### 3. Hermes Page (Default Widgets)
| Widget | Description |
|--------|-------------|
| Health Status | hermes doctor output |
| Config Status | Model, provider, API keys |
| Skills Loaded | Number of skills, last update |
| Cost Tracker | Estimated cost this month |
| Tools | List of tools enabled |
| Version | Current hermes version |

### 4. Projects Page
- Project list with:
  - Name, description
  - Folder size
  - Stack (auto-detect: package.json, requirements.txt, go.mod, etc.)
  - Percentage (based on task list/phases)
- Create new / Import existing
- Click to enter project chat

### 5. Chat (Global)
- Global chat (not project-specific)
- RAG over conversations

### 6. Settings Page
#### Widget Configuration
- Drag & drop widgets
- Resize widgets
- Choose position & size
- Toggle visibility

#### Hermes Configuration
- Model AI setup (provider, API key)
- All hermes config options
- Module installation (from awesome-hermes-agent)
- Opensource alternatives marked

#### VPS Configuration
- Port settings
- Install location

## Module Installation
- All modules from awesome-hermes-agent NOT in hermes-agent setting
- Mark as **opensource** (no API key required)
- Filter to show opensource modules only by default

## Local-First Options
- Show opensource alternatives:
  - Ollama (local LLM) - **CHECK VPS CAPABILITY FIRST**
  - SearXNG (search)
  - Scraping-ant/Crawl4AI (scraping)
- Default: API keys
- Show info that alternatives exist

## Project Concept (NEW FEATURE)
- **Percentage:** Calced from task list (e.g., 6 phases → phase 3 = 50%)
- **Stack:** Auto-detect from package.json, requirements.txt, go.mod, etc.
- Import from existing folders or create manual

## Tech Stack Decision
- Lightest + Most Reliable Options Research:
  1. **Bun + Vue 3** - Fastest runtime, light
  2. **Next.js + SQLite** - Full-stack JS, proven
  3. **SvelteKit + SQLite** - Very light
- Decision: Need more research → ask user

## One-Line Install
```bash
curl -fsSL https://your-server/hermes-web-ui/install.sh | bash
```
Questions at install:
1. Install location (/opt/hermes-web-ui or custom)
2. Port (default 3000)
3. Admin password

## Phase 1: Exploration Complete ✓

## Phase 2: Interview In Progress
- [x] Widgets confirmed
- [x] Modules confirmed (opensource only)
- [x] Local-first confirmed (with VPS check)
- [x] Project concept confirmed
- [ ] Tech stack - need option selection