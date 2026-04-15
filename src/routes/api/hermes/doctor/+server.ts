import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function hermesAvailable() {
  try {
    await execAsync('which hermes');
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
    const { stdout: version } = await execAsync('hermes --version 2>/dev/null || echo "unknown"');
    const { stdout: config } = await execAsync('cat ~/.hermes/config.yaml 2>/dev/null || echo ""');
    
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
      version: version.trim() || 'unknown',
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