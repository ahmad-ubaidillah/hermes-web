import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const ALLOWED_HERMES_COMMANDS = ['chat', 'doctor', 'setup', 'update', 'version'] as const;
type HermesCommand = typeof ALLOWED_HERMES_COMMANDS[number];

function sanitizeForShell(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function validateHermesCommand(cmd: string): cmd is HermesCommand {
  return (ALLOWED_HERMES_COMMANDS as readonly string[]).includes(cmd);
}

export async function chatWithHermes(message: string, context?: string): Promise<string> {
  try {
    const hermesPath = '/usr/local/bin/hermes';
    
    try {
      await execFileAsync('which', ['hermes']);
    } catch {
      return 'Hermes CLI not found. Please install Hermes first.';
    }
    
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`;
    }
    
    prompt = sanitizeForShell(prompt);
    
    const { stdout, stderr } = await execFileAsync(
      hermesPath,
      ['chat', '--non-interactive', '--prompt', prompt],
      { timeout: 120000 }
    );
    
    return stdout || stderr || 'No response from Hermes';
  } catch (error: any) {
    if (error.message?.includes('not found') || error.code === 'ENOENT') {
      return 'Hermes CLI not installed. Go to /setup to install.';
    }
    return `Error: ${error.message}`;
  }
}

export async function checkHermesCLI(): Promise<{ installed: boolean; version: string }> {
  try {
    const { stdout } = await execFileAsync('hermes', ['--version']);
    return { installed: true, version: stdout.trim() };
  } catch {
    return { installed: false, version: '' };
  }
}