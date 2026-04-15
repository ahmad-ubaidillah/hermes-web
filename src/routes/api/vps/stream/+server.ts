import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      const fetchMetrics = async () => {
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
          
          const { stdout: docker } = await execAsync('docker ps -q');
          const { stdout: images } = await execAsync('docker images -q');
          
          const { stdout: load } = await execAsync('cat /proc/loadavg');
          const cpu = parseFloat(load.split(' ')[0]) || 0;
          
          send({
            type: 'metrics',
            memory: { used, available: avail, total, percent: total > 0 ? Math.round((used / total) * 100) : 0 },
            docker: { running: docker.trim().split('\n').filter(Boolean).length, images: images.trim().split('\n').filter(Boolean).length },
            cpu
          });
        } catch (e) {
          send({ type: 'error', message: String(e) });
        }
      };
      
      send({ type: 'connected', message: 'Hermes Web UI Real-time' });
      
      await fetchMetrics();
      
      const interval = setInterval(fetchMetrics, 5000);
      
      const closed = (controller as any).closed?.then?.(() => {
        clearInterval(interval);
      });
      
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 300000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}