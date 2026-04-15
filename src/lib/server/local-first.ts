import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface LocalFirstConfig {
  llmProvider: 'ollama' | 'openrouter' | 'vllm' | 'custom';
  webSearch: 'duckduckgo' | 'searxng' | 'serper';
  webCrawl: 'firecrawl' | 'crawl4ai';
  tts: 'edge' | 'coqui' | 'elevenlabs';
}

export async function detectLocalFirstServices() {
  const services = {
    ollama: { running: false, url: 'http://localhost:11434', models: [] as string[] },
    searxng: { running: false, url: 'http://localhost:8888' },
    crawl4ai: { running: false, url: 'http://localhost:8000' },
    docker: { running: false }
  };

  try {
    await exec_async('curl -s http://localhost:11434/api/tags');
    const { stdout } = await execAsync('curl -s http://localhost:11434/api/tags');
    const data = JSON.parse(stdout);
    services.ollama = { 
      running: true, 
      url: 'http://localhost:11434', 
      models: data.models?.map((m: any) => m.name) || [] 
    };
  } catch {}

  try {
    await execAsync('curl -s http://localhost:8888');
    services.searxng.running = true;
  } catch {}

  try {
    await execAsync('curl -s http://localhost:8000');
    services.crawl4ai.running = true;
  } catch {}

  try {
    await execAsync('docker --version');
    services.docker.running = true;
  } catch {}

  return services;
}

export async function getCurrentLLMConfig() {
  try {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) return null;
    
    const configPath = `${homeDir}/.hermes/config.yaml`;
    try {
      const { stdout } = await execAsync(`cat ${configPath} 2>/dev/null`);
      return stdout;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}