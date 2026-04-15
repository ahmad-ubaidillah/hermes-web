import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';

const execFileAsync = promisify(execFile);

async function hermesAvailable() {
  try {
    await execFileAsync('which', ['hermes']);
    return true;
  } catch {
    return false;
  }
}

async function runHermesDoctor() {
  const available = await hermesAvailable();
  if (!available) {
    return {
      status: 'red',
      issues: ['Hermes not installed. Run installation first.'],
      version: null,
      config: null
    };
  }

  try {
    let version = 'unknown';
    try {
      const { stdout } = await execFileAsync('hermes', ['--version']);
      version = stdout.trim() || 'unknown';
    } catch {}

    let config = '';
    try {
      const homeDir = process.env.HOME || process.env.USERPROFILE || '/root';
      config = await readFile(join(homeDir, '.hermes', 'config.yaml'), 'utf-8');
    } catch {}
    
    const issues: string[] = [];
    
    if (!config) {
      issues.push('No Hermes config found. Run hermes setup.');
    }
    
    const hasApiKey = config.includes('api_key') || config.includes('OPENAI_API_KEY');
    if (!hasApiKey) {
      issues.push('No API key configured');
    }
    
    return {
      status: issues.length === 0 ? 'green' : issues.length === 1 ? 'yellow' : 'red',
      issues,
      version: version || 'unknown',
      config: config ? 'configured' : 'not configured'
    };
  } catch (error) {
    return {
      status: 'red',
      issues: [String(error)],
      version: null,
      config: null
    };
  }
}

export const GET: RequestHandler = async () => {
  try {
    const health = await runHermesDoctor();
    return json(health);
  } catch (error) {
    return json({ status: 'red', issues: [String(error)] }, { status: 500 });
  }
};