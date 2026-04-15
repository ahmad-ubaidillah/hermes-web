import { createHash, randomBytes } from 'crypto';
import Database from 'better-sqlite3';

const db = new Database('hermes-web-ui.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: string;
}

const HASH_ALGO = 'sha256';

function hashPassword(password: string, salt: string): string {
  return createHash(HASH_ALGO).update(password + salt).digest('hex');
}

export function createUser(username: string, password: string): { success: boolean; error?: string } {
  try {
    const salt = randomBytes(32).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const id = randomBytes(16).toString('hex');
    
    const stmt = db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)');
    stmt.run(id, username, passwordHash + ':' + salt);
    
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes('UNIQUE')) {
      return { success: false, error: 'Username already exists' };
    }
    return { success: false, error: String(error) };
  }
}

export function verifyUser(username: string, password: string): { valid: boolean; user?: { id: string; username: string; role: string }; error?: string } {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as UserRow | undefined;
    
    if (!user) {
      return { valid: false, error: 'User not found' };
    }
    
    const [storedHash, salt] = user.password_hash.split(':');
    const passwordHash = hashPassword(password, salt);
    
    if (passwordHash !== storedHash) {
      return { valid: false, error: 'Invalid password' };
    }
    
    return { valid: true, user: { id: user.id, username: user.username, role: user.role } };
  } catch (error: unknown) {
    return { valid: false, error: String(error) };
  }
}

export function createSession(userId: string): string {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt);
  
  return sessionId;
}

export function verifySession(sessionId: string): { valid: boolean; user?: { id: string; username: string; role: string } } {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow | undefined;
  
  if (!session) {
    return { valid: false };
  }
  
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return { valid: false };
  }
  
  const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(session.user_id) as UserRow | undefined;
  if (!user) return { valid: false };
  return { valid: true, user: { id: user.id, username: user.username, role: user.role } };
}

export function deleteSession(sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function getUsers(): UserRow[] {
  const stmt = db.prepare('SELECT id, username, role FROM users');
  return stmt.all() as UserRow[];
}

export function initDefaultAdmin(): void {
  const users = getUsers();
  if (users.length === 0) {
    const password = process.env.ADMIN_PASSWORD || 'hermes123';
    createUser('admin', password);
    console.warn('Default admin created: admin/' + (process.env.ADMIN_PASSWORD ? '***' : 'hermes123'));
  }
}

initDefaultAdmin();