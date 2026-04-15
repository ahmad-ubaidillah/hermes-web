import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'install':
        const { stdout: installOutput, stderr: installError } = await execAsync(
          'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash',
          { timeout: 300000 }
        );
        return json({ success: true, output: installOutput, error: installError });
      
      case 'setup':
        await execAsync('echo "" | hermes setup', { timeout: 120000 });
        return json({ success: true, message: 'Setup initiated' });
      
      case 'doctor':
        const { stdout: doctorOutput } = await execAsync('hermes doctor 2>&1');
        return json({ success: true, output: doctorOutput });
      
      case 'update':
        const { stdout: updateOutput } = await execAsync('hermes update 2>&1');
        return json({ success: true, output: updateOutput });
      
      default:
        return json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  try {
    const { stdout: whichHermes } = await execAsync('which hermes 2>/dev/null || echo ""');
    const installed = whichHermes.trim().length > 0;
    
    let version = '';
    if (installed) {
      try {
        const { stdout } = await execAsync('hermes --version 2>/dev/null || echo ""');
        version = stdout.trim();
      } catch {
        version = 'unknown';
      }
    }
    
    return json({
      installed,
      version,
      canInstall: true,
      canUpdate: installed
    });
  } catch (error) {
    return json({ installed: false, version: '', canInstall: true });
  }
};