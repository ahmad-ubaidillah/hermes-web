import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const ALLOWED_ACTIONS = ['install', 'setup', 'doctor', 'update'] as const;
type AllowedAction = typeof ALLOWED_ACTIONS[number];

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();
    
    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return json({ error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` }, { status: 400 });
    }
    
    switch (action as AllowedAction) {
      case 'install': {
        const { stdout, stderr } = await execFileAsync(
          'bash',
          ['-c', 'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash'],
          { timeout: 300000 }
        );
        return json({ success: true, output: stdout, error: stderr });
      }
      
      case 'setup': {
        const { stdout } = await execFileAsync('hermes', ['setup'], { timeout: 120000 });
        return json({ success: true, message: 'Setup initiated', output: stdout });
      }
      
      case 'doctor': {
        const { stdout } = await execFileAsync('hermes', ['doctor']);
        return json({ success: true, output: stdout });
      }
      
      case 'update': {
        const { stdout } = await execFileAsync('hermes', ['update']);
        return json({ success: true, output: stdout });
      }
    }
  } catch (error: any) {
    return json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  try {
    try {
      await execFileAsync('which', ['hermes']);
      let version = 'unknown';
      try {
        const { stdout } = await execFileAsync('hermes', ['--version']);
        version = stdout.trim();
      } catch {}
      
      return json({ installed: true, version, canInstall: true, canUpdate: true });
    } catch {
      return json({ installed: false, version: '', canInstall: true, canUpdate: false });
    }
  } catch (error) {
    return json({ installed: false, version: '', canInstall: true });
  }
};