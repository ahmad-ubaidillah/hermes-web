import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as systemStats from '$lib/server/system-stats';

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type') || 'all';
  
  try {
    switch (type) {
      case 'system':
        return json(await systemStats.getSystemInfo());
      case 'memory':
        return json(await systemStats.getMemoryUsage());
      case 'disk':
        return json(await systemStats.getDiskUsage());
      case 'network':
        return json(await systemStats.getNetworkStats());
      case 'docker':
        return json(await systemStats.getDockerStats());
      case 'services':
        return json(await systemStats.getServices());
      default:
        return json({
          system: await systemStats.getSystemInfo(),
          memory: await systemStats.getMemoryUsage(),
          disk: await systemStats.getDiskUsage(),
          network: await systemStats.getNetworkStats(),
          docker: await systemStats.getDockerStats(),
          services: await systemStats.getServices()
        });
    }
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};