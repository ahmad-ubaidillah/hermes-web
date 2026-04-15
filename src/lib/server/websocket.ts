import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VPSMetrics {
  memory: { used: number; available: number; total: number; percent: number };
  disk: any[];
  docker: { running: number; images: number };
  cpu: number;
}

async function getVPSMetrics(): Promise<VPSMetrics> {
  try {
    const { stdout: meminfo } = await execAsync('cat /proc/meminfo');
    const memLines = meminfo.split('\n');
    const getMem = (key: string) => {
      const line = memLines.find(l => l.startsWith(key));
      return line ? parseInt(line.replace(key, '').replace('kB', '').trim()) : 0;
    };
    const total = getMem('MemTotal:');
    const avail = getMem('MemAvailable:');
    const used = total - avail;
    
    const { stdout: disk } = await execAsync("df -h | grep -E '^/dev/' | tail -3");
    const diskData = disk.trim().split('\n').map(line => {
      const parts = line.split(/\s+/);
      return { mount: parts[5] || parts[4], percent: parseInt(parts[4]?.replace('%', '') || '0') };
    }).filter(d => d.mount);
    
    const { stdout: docker } = await execAsync('docker ps -q');
    const { stdout: images } = await execAsync('docker images -q');
    
    const { stdout: load } = await execAsync('cat /proc/loadavg');
    const cpuLoad = parseFloat(load.split(' ')[0]) || 0;
    
    return {
      memory: { used, available: avail, total, percent: total > 0 ? Math.round((used / total) * 100) : 0 },
      disk: diskData,
      docker: { running: docker.trim().split('\n').filter(Boolean).length, images: images.trim().split('\n').filter(Boolean).length },
      cpu: cpuLoad
    };
  } catch {
    return { memory: { used: 0, available: 0, total: 0, percent: 0 }, disk: [], docker: { running: 0, images: 0 }, cpu: 0 };
  }
}

const port = 3001;
const server = createServer();
const wss = new WebSocketServer({ server });

console.log(`Starting WebSocket server on port ${port}...`);

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.send(JSON.stringify({ type: 'connected', message: 'Hermes Web UI Real-time' }));
  
  const interval = setInterval(async () => {
    try {
      const metrics = await getVPSMetrics();
      ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
    } catch (e) {
      console.error('Error fetching metrics:', e);
    }
  }, 5000);
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
  
  ws.on('error', (e) => {
    console.error('WebSocket error:', e);
  });
});

server.listen(port, () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
});