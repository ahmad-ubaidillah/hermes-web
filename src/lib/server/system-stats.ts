import { execFile } from 'child_process';
import { promisify } from 'util';
import * as sysInfo from '$lib/server/system-info';
import { getCachedOrFetch } from '$lib/server/cache';

const execFileAsync = promisify(execFile);

export async function getSystemInfo() {
  return getCachedOrFetch('vps:system', async () => {
    const [cpu, memInfo, hostname, uptime] = await Promise.all([
      sysInfo.getCPUModel(),
      sysInfo.getMemInfo(),
      sysInfo.getHostname(),
      sysInfo.getUptime()
    ]);
    return {
      cpu: cpu || 'Unknown',
      memory: `${Math.round(memInfo.totalKB / 1024)} MB`,
      hostname: hostname || 'Unknown',
      uptime: uptime || 'Unknown'
    };
  });
}

export async function getMemoryUsage() {
  return getCachedOrFetch('vps:memory', async () => {
    const info = await sysInfo.getMemInfo();
    return {
      used: info.totalKB - info.availableKB,
      available: info.availableKB,
      total: info.totalKB,
      percent: info.percent
    };
  });
}

export async function getDiskUsage() {
  return getCachedOrFetch('vps:disk', async () => {
    try {
      const { stdout } = await execFileAsync('df', ['-h']);
      const disks = stdout.trim().split('\n').slice(1).filter(line => line.startsWith('/dev/')).slice(0, 5).map(line => {
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
  });
}

export async function getNetworkStats() {
  return getCachedOrFetch('vps:network', async () => {
    try {
      const { stdout: hostname } = await execFileAsync('hostname', ['-I']);
      const { stdout: defaultGateway } = await execFileAsync('bash', ['-c', 'ip route | grep default | cut -d" " -f3 | head -1']);
      return {
        ip: hostname.trim() || 'Unknown',
        gateway: defaultGateway.trim() || 'Unknown'
      };
    } catch {
      return { ip: 'Unknown', gateway: 'Unknown' };
    }
  });
}

export async function getDockerStats() {
  return getCachedOrFetch('vps:docker', async () => {
    try {
      const { stdout: containers } = await execFileAsync('docker', ['ps', '--format', '{{.Names}}']);
      const { stdout: images } = await execFileAsync('docker', ['images', '-q']);
      const containerList = containers.trim().split('\n').filter(Boolean);
      const imageCount = images.trim().split('\n').filter(Boolean).length;
      return { running: containerList.length, containers: containerList, images: imageCount };
    } catch {
      return { running: 0, containers: [], images: 0 };
    }
  });
}

export async function getServices() {
  return getCachedOrFetch('vps:services', async () => {
    try {
      const { stdout } = await execFileAsync('systemctl', ['list-units', '--type=service', '--state=running', '--no-pager', '--no-legend']);
      return stdout.trim().split('\n').filter(Boolean).slice(0, 10).map(line => {
        const parts = line.split(/\s+/);
        return { name: parts[0], status: 'running' };
      });
    } catch {
      return [];
    }
  });
}