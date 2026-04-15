import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function chatWithHermes(message: string, context?: string): Promise<string> {
  try {
    const hermesPath = (await execAsync('which hermes')).stdout.trim();
    
    if (!hermesPath) {
      return 'Hermes CLI not found. Please install Hermes first.';
    }
    
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`;
    }
    
    const { stdout, stderr } = await execAsync(
      `echo "${prompt.replace(/"/g, '\\"')}" | hermes chat --non-interactive 2>&1`,
      { timeout: 120000 }
    );
    
    return stdout || stderr || 'No response from Hermes';
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return 'Hermes CLI not installed. Go to /setup to install.';
    }
    return `Error: ${error.message}`;
  }
}

export async function checkHermesCLI(): Promise<{ installed: boolean; version: string }> {
  try {
    const { stdout } = await execAsync('hermes --version 2>&1');
    return { installed: true, version: stdout.trim() };
  } catch {
    return { installed: false, version: '' };
  }
}