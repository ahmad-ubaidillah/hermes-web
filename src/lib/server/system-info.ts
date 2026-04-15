import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execFileAsync = promisify(execFile);

export interface MemoryInfo {
  total: number;
  available: number;
  used: number;
  percent: number;
  totalKB: number;
  availableKB: number;
}

let memoryCache: MemoryInfo | null = null;
let memoryCacheTime = 0;
const CACHE_TTL = 3000;

export async function getMemInfo(): Promise<MemoryInfo> {
  const now = Date.now();
  if (memoryCache && now - memoryCacheTime < CACHE_TTL) {
    return memoryCache;
  }

  try {
    const content = await readFile('/proc/meminfo', 'utf-8');
    const lines = content.split('\n');
    const getValue = (key: string) => {
      const line = lines.find(l => l.startsWith(key));
      return line ? parseInt(line.replace(key, '').replace(/kB/g, '').trim()) || 0 : 0;
    };

    const totalKB = getValue('MemTotal:');
    const availableKB = getValue('MemAvailable:');
    const usedKB = totalKB - availableKB;
    const percent = totalKB > 0 ? Math.round((usedKB / totalKB) * 100) : 0;

    memoryCache = {
      total: usedKB,
      available: availableKB,
      used: usedKB,
      percent,
      totalKB,
      availableKB
    };
    memoryCacheTime = now;
    return memoryCache;
  } catch {
    return { total: 0, available: 0, used: 0, percent: 0, totalKB: 0, availableKB: 0 };
  }
}

export async function getCPUCount(): Promise<number> {
  try {
    const { stdout } = await execFileAsync('nproc', []);
    return parseInt(stdout.trim()) || 1;
  } catch {
    return 1;
  }
}

export async function getUptime(): Promise<string> {
  try {
    const content = await readFile('/proc/uptime', 'utf-8');
    const seconds = parseFloat(content.split(' ')[0]);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  } catch {
    return 'Unknown';
  }
}

export async function getHostname(): Promise<string> {
  try {
    const { stdout } = await execFileAsync('hostname', []);
    return stdout.trim();
  } catch {
    return 'Unknown';
  }
}

export async function getCPUModel(): Promise<string> {
  try {
    const { stdout } = await execFileAsync('grep', ['-m', '1', 'model name', '/proc/cpuinfo']);
    return stdout.replace('model name\t:', '').trim() || 'Unknown';
  } catch {
    return 'Unknown';
  }
}