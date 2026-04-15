import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

const db = new Database('hermes-web-ui.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    folder_path TEXT,
    stack TEXT,
    percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    phase INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS widget_config (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    size TEXT DEFAULT 'medium',
    visible INTEGER DEFAULT 1,
    position INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS deployed_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    project_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export { db };

export function createProject(name: string, description: string, folderPath?: string) {
  const id = uuid();
  const stmt = db.prepare('INSERT INTO projects (id, name, description, folder_path) VALUES (?, ?, ?, ?)');
  stmt.run(id, name, description, folderPath || null);
  return { id, name, description, folder_path: folderPath };
}

export function getProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

export function getProject(id: string) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

export function updateProject(id: string, data: Partial<{ name: string; description: string; folder_path: string; stack: string; percentage: number }>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`UPDATE projects SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
  stmt.run(...values, id);
}

export function deleteProject(id: string) {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

export function createTask(projectId: string, title: string, phase: number = 1) {
  const id = uuid();
  db.prepare('INSERT INTO tasks (id, project_id, title, phase) VALUES (?, ?, ?, ?)').run(id, projectId, title, phase);
  return { id, project_id: projectId, title, status: 'todo', phase };
}

export function getTasks(projectId: string) {
  return db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY phase, created_at').all(projectId);
}

export function updateTask(taskId: string, data: Partial<{ title: string; status: string; phase: number }>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, taskId);
}

export function deleteTask(taskId: string) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
}

export function getSetting(key: string) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function getAllSettings() {
  const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export function getWidgetConfig() {
  return db.prepare('SELECT * FROM widget_config ORDER BY position').all();
}

export function saveWidgetConfig(widgets: { id: string; name: string; size: string; visible: number; position: number }[]) {
  db.prepare('DELETE FROM widget_config').run();
  const stmt = db.prepare('INSERT INTO widget_config (id, name, size, visible, position) VALUES (?, ?, ?, ?, ?)');
  for (const w of widgets) {
    stmt.run(w.id, w.name, w.size, w.visible ? 1 : 0, w.position);
  }
}

export function getDeployedConfig(key: string) {
  const row = db.prepare('SELECT value FROM deployed_config WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}

export function setDeployedConfig(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO deployed_config (key, value) VALUES (?, ?)').run(key, value);
}

export function createActivityLog(userId: string, action: string, details?: string, ipAddress?: string) {
  const id = uuid();
  db.prepare('INSERT INTO activity_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)').run(id, userId, action, details || null, ipAddress || null);
}

export function getActivityLogs(limit: number = 50) {
  return db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function updatePassword(userId: string, newPasswordHash: string) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, userId);
}

export function saveChatMessage(role: string, content: string, projectId?: string) {
  const id = uuid();
  db.prepare('INSERT INTO chat_messages (id, role, content, project_id) VALUES (?, ?, ?, ?)').run(id, role, content, projectId || null);
}

export function getChatMessages(projectId?: string, limit: number = 100) {
  if (projectId) {
    return db.prepare('SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at DESC LIMIT ?').all(projectId, limit);
  }
  return db.prepare('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function searchChatMessages(query: string, limit: number = 50) {
  return db.prepare("SELECT * FROM chat_messages WHERE content LIKE ? ORDER BY created_at DESC LIMIT ?").all(`%${query}%`, limit);
}