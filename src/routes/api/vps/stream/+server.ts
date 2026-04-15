import { execFile } from 'child_process';
import { promisify } from 'util';
import * as sysInfo from '$lib/server/system-info';

const execFileAsync = promisify(execFile);

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      const fetchMetrics = async () => {
        try {
          const memInfo = await sysInfo.getMemInfo();
          
          const { stdout: docker } = await execFileAsync('docker', ['ps', '-q']).catch(() => ({ stdout: '' }));
          const { stdout: images } = await execFileAsync('docker', ['images', '-q']).catch(() => ({ stdout: '' }));
          
          const { stdout: load } = await execFileAsync('cat', ['/proc/loadavg']);
          const cpu = parseFloat(load.split(' ')[0]) || 0;
          
          send({
            type: 'metrics',
            memory: { used: memInfo.used, available: memInfo.available, total: memInfo.totalKB, percent: memInfo.percent },
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
      
      setTimeout(() => {
        clearInterval(interval);
        try { controller.close(); } catch {}
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