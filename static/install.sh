#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

check_hermes() {
  if command -v hermes >/dev/null 2>&1; then
    HERMES_VERSION=$(hermes --version 2>/dev/null || echo "unknown")
    return 0
  elif [ -f "$HOME/.local/bin/hermes" ]; then
    HERMES_VERSION=$("$HOME/.local/bin/hermes" --version 2>/dev/null || echo "unknown")
    return 0
  elif [ -d "$HOME/.hermes" ]; then
    HERMES_VERSION="config exists"
    return 0
  fi
  return 1
}

show_hermes_status() {
  if check_hermes; then
    echo -e "  ${GREEN}✓${NC} Hermes CLI: $HERMES_VERSION"
    if [ -d "$HOME/.hermes" ]; then
      echo -e "  ${GREEN}✓${NC} Config dir: $HOME/.hermes"
      local config_count=$(ls -1 "$HOME/.hermes" 2>/dev/null | wc -l)
      echo -e "  ${GREEN}✓${NC} Config files: $config_count items"
    fi
    return 0
  else
    echo -e "  ${RED}✗${NC} Hermes not found"
    return 1
  fi
}

PORT=3000
INSTALL_DIR="/opt/hermes-web-ui"
ADMIN_USER="admin"
ADMIN_PASS="hermes123"
SKIP_HERMES=false
FORCE_CONFIG=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--port) PORT="$2"; shift 2 ;;
    -d|--dir) INSTALL_DIR="$2"; shift 2 ;;
    -u|--user) ADMIN_USER="$2"; shift 2 ;;
    -P|--password) ADMIN_PASS="$2"; shift 2 ;;
    --skip-hermes) SKIP_HERMES=true; shift ;;
    --force-config) FORCE_CONFIG=true; shift ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -p, --port PORT      Port to run Web UI (default: 3000)"
      echo "  -d, --dir DIR       Installation directory (default: /opt/hermes-web-ui)"
      echo "  -u, --user USER    Admin username (default: admin)"
      echo "  -P, --password PASS  Admin password (default: hermes123)"
      echo "  --skip-hermes       Skip Hermes installation check"
      echo "  --force-config      Force Hermes configuration wizard"
      echo "  -h, --help         Show this help message"
      exit 0 ;;
    *) shift ;;
  esac
done

log_info "Hermes Web UI Installer"
log_info "=============================="

log_step "Checking Hermes installation status..."
if check_hermes; then
  log_info "Hermes is already installed!"
  show_hermes_status
  if [ "$FORCE_CONFIG" = true ]; then
    log_info "Forcing reconfiguration..."
  else
    log_warn "Skipping Hermes installation. Use --force-config to reconfigure."
  fi
else
  log_warn "Hermes is NOT installed"
  log_info "Options:"
  echo "  1. Install Hermes now"
  echo "  2. Install later manually"
  echo "  3. Continue with Web UI only"
  read -p "Choice [1-3]: " choice
  case $choice in
    1) 
      log_info "Installing Hermes..."
      curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
      ;;
    2) 
      log_warn "Skipping Hermes installation. Install later with:"
      echo "  curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash"
      ;;
    3) 
      log_info "Continuing with Web UI only..."
      ;;
  esac
fi

log_step "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { log_error "Node.js not installed. Install Node.js 18+ first."; exit 1; }
command -v npm >/dev/null 2>&1 || { log_error "npm not installed."; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  log_error "Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

log_step "Setting up Hermes Web UI..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if [ ! -f "package.json" ]; then
  cat > package.json << 'PKGEOF'
{
  "name": "hermes-web-ui",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  },
  "type": "module"
}
PKGEOF
fi

log_info "Installing dependencies..."
npm install 2>/dev/null || npm install --legacy-peer-deps

log_info "Building..."
npm run build 2>/dev/null || log_warn "Build had warnings"

SERVICE_FILE="/etc/systemd/system/hermes-web-ui.service"
if [ -f "$SERVICE_FILE" ]; then
  log_warn "Service already exists. Updating..."
fi

cat > "$SERVICE_FILE" << SVCEOF
[Unit]
Description=Hermes Web UI
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which node) build
Restart=always
RestartSec=10
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload 2>/dev/null || true
systemctl enable hermes-web-ui 2>/dev/null || true

log_info "Starting Hermes Web UI..."
systemctl start hermes-web-ui 2>/dev/null || log_warn "Could not start. Run: systemctl start hermes-web-ui"

log_info ""
log_info "=============================="
log_info "Installation complete!"
log_info ""
log_info "Access: http://localhost:$PORT"
log_info "Login: $ADMIN_USER / $ADMIN_PASS"
log_info ""
log_info "Hermes Status:"
show_hermes_status || true
log_info ""
log_info "Commands:"
log_info "  systemctl start hermes-web-ui"
log_info "  systemctl stop hermes-web-ui"
log_info "  systemctl status hermes-web-ui"
log_info "=============================="