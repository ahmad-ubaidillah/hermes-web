import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';

const execFileAsync = promisify(execFile);

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
    const { stdout } = await execFileAsync('curl', ['-s', 'http://localhost:11434/api/tags']);
    const data = JSON.parse(stdout);
    services.ollama = {
      running: true,
      url: 'http://localhost:11434',
      models: data.models?.map((m: any) => m.name) || []
    };
  } catch {}

  try {
    await execFileAsync('curl', ['-s', 'http://localhost:8888']);
    services.searxng.running = true;
  } catch {}

  try {
    await execFileAsync('curl', ['-s', 'http://localhost:8000']);
    services.crawl4ai.running = true;
  } catch {}

  try {
    await execFileAsync('docker', ['--version']);
    services.docker.running = true;
  } catch {}

  return services;
}

export async function getCurrentLLMConfig() {
  try {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) return null;

    const configPath = join(homeDir, '.hermes', 'config.yaml');
    try {
      const content = await readFile(configPath, 'utf-8');
      return content;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}