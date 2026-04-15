import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

export const GET: RequestHandler = async () => {
  try {
    const widgets = db.getWidgetConfig();
    if (!widgets || widgets.length === 0) {
      db.saveWidgetConfig([
        { id: 'system', name: 'System Info', size: 'medium', visible: 1, position: 0 },
        { id: 'memory', name: 'Memory', size: 'medium', visible: 1, position: 1 },
        { id: 'disk', name: 'Disk', size: 'medium', visible: 1, position: 2 },
        { id: 'network', name: 'Network', size: 'small', visible: 1, position: 3 },
        { id: 'docker', name: 'Docker', size: 'small', visible: 1, position: 4 },
        { id: 'services', name: 'Services', size: 'medium', visible: 1, position: 5 },
      ]);
      return json([
        { id: 'system', name: 'System Info', size: 'medium', visible: 1, position: 0 },
        { id: 'memory', name: 'Memory', size: 'medium', visible: 1, position: 1 },
        { id: 'disk', name: 'Disk', size: 'medium', visible: 1, position: 2 },
        { id: 'network', name: 'Network', size: 'small', visible: 1, position: 3 },
        { id: 'docker', name: 'Docker', size: 'small', visible: 1, position: 4 },
        { id: 'services', name: 'Services', size: 'medium', visible: 1, position: 5 },
      ]);
    }
    return json(widgets);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { widgets } = await request.json();
    db.saveWidgetConfig(widgets);
    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};