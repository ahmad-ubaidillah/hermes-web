import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getSystemInfo() {
  try {
    const { stdout: cpuinfo } = await execAsync('cat /proc/cpuinfo | grep "model name" | head -1');
    const { stdout: meminfo } = await execAsync('cat /proc/meminfo | grep MemTotal');
    const { stdout: hostname } = await execAsync('hostname');
    
    const cpu = cpuinfo.replace('model name\t:', '').trim();
    const mem = meminfo.replace('MemTotal\t:', '').trim();
    
    return {
      cpu: cpu || 'Unknown',
      memory: mem || 'Unknown',
      hostname: hostname.trim(),
      uptime: await getUptime()
    };
  } catch {
    return { cpu: 'Unknown', memory: 'Unknown', hostname: 'Unknown', uptime: 'Unknown' };
  }
}

async function getUptime() {
  try {
    const { stdout } = await execAsync('cat /proc/uptime | cut -d" " -f1');
    const seconds = parseFloat(stdout.trim());
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  } catch {
    return 'Unknown';
  }
}

export async function getMemoryUsage() {
  try {
    const { stdout } = await execAsync('cat /proc/meminfo');
    const lines = stdout.split('\n');
    const getValue = (key: string) => {
      const line = lines.find(l => l.startsWith(key));
      return line ? line.replace(key, '').replace(/kB/g, '').trim() : '0';
    };
    
    const total = parseInt(getValue('MemTotal:')) || 0;
    const available = parseInt(getValue('MemAvailable:')) || 0;
    const used = total - available;
    const percent = total > 0 ? Math.round((used / total) * 100) : 0;
    
    return { used, available, total, percent };
  } catch {
    return { used: 0, available: 0, total: 0, percent: 0 };
  }
}

export async function getDiskUsage() {
  try {
    const { stdout } = await execAsync("df -h | grep -E '^/dev/' | tail -5");
    const disks = stdout.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split(/\s+/);
      return {
        mount: parts[5] || parts[4],
        size: parts[1],
        used: parts[2],
        avail: parts[3],
        percent: parseInt(parts[4]?.replace('%', '') || '0')
      };
    });
    return disks;
  } catch {
    return [];
  }
}

export async function getNetworkStats() {
  try {
    const { stdout: hostname } = await execAsync('hostname -I');
    const { stdout: defaultGateway } = await execAsync("ip route | grep default | cut -d' ' -f3 | head -1");
    
    return {
      ip: hostname.trim() || 'Unknown',
      gateway: defaultGateway.trim() || 'Unknown'
    };
  } catch {
    return { ip: 'Unknown', gateway: 'Unknown' };
  }
}

export async function getDockerStats() {
  try {
    const { stdout: containers } = await execAsync('docker ps --format "{{.Names}}"');
    const { stdout: images } = await execAsync('docker images -q');
    
    const containerList = containers.trim().split('\n').filter(Boolean);
    const imageCount = images.trim().split('\n').filter(Boolean).length;
    
    return {
      running: containerList.length,
      containers: containerList,
      images: imageCount
    };
  } catch {
    return { running: 0, containers: [], images: 0 };
  }
}

export async function getServices() {
  try {
    const { stdout } = await execAsync('systemctl list-units --type=service --state=running --no-pager --no-legend | head -10');
    return stdout.trim().split('\n').filter(Boolean).slice(0, 10).map(line => {
      const parts = line.split(/\s+/);
      return { name: parts[0], status: 'running' };
    });
  } catch {
    return [];
  }
}