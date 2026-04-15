# Hermes Web UI

A modern web interface for managing Hermes Agent - the autonomous AI agent with persistent memory.

![Hermes Web UI](https://img.shields.io/badge/Hermes--Web--UI-0.0.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Tech Stack](https://img.shields.io/badge/Tech-SvelteKit%205%20%2B%20SQLite-orange)

## Overview

Hermes Web UI provides a complete web-based management interface for Hermes Agent. It enables users to:
- Install and configure Hermes Agent via a guided setup wizard
- Monitor VPS system metrics in real-time
- Manage projects with Kanban boards
- Chat with Hermes from any page
- Configure local-first AI alternatives (Ollama, SearXNG, Crawl4AI)
- Install modules from awesome-hermes-agent

## Features

| Category | Features |
|---------|----------|
| **Monitoring** | Real-time VPS metrics (CPU, Memory, Disk, Network, Docker, Services) |
| **Hermes** | Install, health check, configuration, skills, cost tracking |
| **Projects** | Kanban board with drag-and-drop, task percentages, RAG indexing |
| **Chat** | Global chat interface, history search, conversation persistence |
| **Auth** | Session-based login, activity logging, password management |
| **Widgets** | Customizable dashboard widgets, drag & drop, resizable, persisted |
| **Theming** | Dark/Light mode toggle with localStorage |
| **Modules** | Install opensource modules from awesome-hermes-agent |

## Tech Stack

- **Frontend**: SvelteKit + Svelte 5
- **Styling**: TailwindCSS 4
- **Database**: SQLite (better-sqlite3)
- **Language**: TypeScript
- **Build**: Vite
- **Runtime**: Node.js

## Quick Start

### One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/nousresearch/hermes-agent/main/static/install.sh | bash
```

The install script will:
1. Check if Hermes is already installed
2. If found: display status and skip installation
3. If not found: offer three options:
   - Install Hermes now
   - Install Hermes later
   - Continue with Web UI only

### Manual Install

```bash
# Clone the repository
git clone https://github.com/nousresearch/hermes-agent.git
cd hermes-agent/hermes-web-ui

# Install dependencies
npm install

# Build for production
npm run build

# Start development server
npm run dev
```

### Docker

```bash
# Build the image
docker build -t hermes-web-ui .

# Run the container
docker run -p 3000:3000 hermes-web-ui
```

Or use docker-compose:

```bash
docker-compose up -d
```

## Default Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `hermes123` |

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview with system stats |
| VPS Monitoring | `/vps` | 6 widgets: System Info, Memory, Disk, Network, Docker, Services |
| Hermes Status | `/hermes` | 6 widgets: Health, Config, Skills, Cost, Tools, Version |
| Setup Wizard | `/setup` | Guided Hermes installation |
| Projects | `/projects` | Kanban board with task tracking |
| Chat | `/chat` | Global chat with Hermes |
| Settings | `/settings` | General, Local-First, VPS Info, Modules |
| Widget Config | `/settings/widgets` | Customize dashboard layout |
| Activity Logs | `/settings/logs` | View authentication logs |
| Password Change | `/settings/password` | Update password |
| Forgot Password | `/forgot-password` | Password recovery |
| Login | `/login` | Authentication page |

## API Endpoints

### VPS APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vps/stats` | GET | System metrics (CPU, Memory, Disk, Network) |
| `/api/vps/capability` | GET | VPS capability check for Ollama |
| `/api/vps/stream` | GET | Server-Sent Events for real-time metrics |

### Hermes APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hermes/doctor` | GET | Hermes health check |
| `/api/hermes/install` | POST | Install Hermes Agent |

### Projects APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET, POST | List/Create projects |
| `/api/projects/[id]/tasks` | GET, POST | List/Create tasks |
| `/api/projects/[id]/index` | POST | Index project files (RAG) |

### Chat APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message to Hermes |
| `/api/chat/history` | GET | Get chat history with search |

### Auth APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/check` | GET | Verify session |

### Admin APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/logs` | GET | Activity logs |
| `/api/admin/password` | POST | Change password |

### Settings APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings/widgets` | GET, PUT | Widget configuration |
| `/api/local-first` | GET | Detect local services |
| `/api/modules` | GET | Available modules |

## Database Schema

| Table | Description |
|------|-------------|
| `projects` | Project data |
| `tasks` | Task items |
| `settings` | User preferences |
| `users` | Admin accounts |
| `sessions` | Auth sessions |
| `activity_logs` | Login/logout tracking |
| `chat_messages` | Chat history |
| `widget_config` | Dashboard widget layouts |

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=production
```

## Project Structure

```
hermes-web-ui/
├── src/
│   ├── routes/
│   │   ├── api/           # API endpoints
│   │   ├── chat/          # Chat page
│   │   ├── hermes/         # Hermes status
│   │   ├── projects/      # Kanban board
│   │   ├── settings/      # Settings pages
│   │   ├── vps/            # VPS monitoring
│   │   ├── setup/          # Setup wizard
│   │   ├── login/          # Auth pages
│   │   └── +page.svelte   # Dashboard
│   ├── lib/
│   │   ├── components/    # Reusable components
│   │   └── db/             # Database utilities
│   └── app.css            # Global styles
├── static/
│   └── install.sh          # One-line install script
├── package.json
├── svelte.config.js
├── tailwind.config.js
└── Dockerfile
```

##Local-First Options

Hermes Web UI supports self-hosted alternatives:

| Service | Purpose | Check Endpoint |
|---------|--------|----------------|
| **Ollama** | Local LLM | `/api/vps/capability` |
| **SearXNG** | Privacy search | `/api/local-first` |
| **Crawl4AI** | Web scraping | `/api/local-first` |

The VPS capability endpoint automatically detects if your server can run Ollama locally.

## License

MIT License - See [LICENSE](LICENSE)

## Credits

- [Hermes Agent](https://github.com/nousresearch/hermes-agent) by Nous Research
- [awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent) modules

---

Built with ❤️ for the Hermes community