import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const logs = db.getActivityLogs(limit);
    return json(logs);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};