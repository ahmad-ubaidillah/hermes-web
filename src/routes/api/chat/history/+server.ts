import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const query = url.searchParams.get('q');
    const projectId = url.searchParams.get('project');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    if (query) {
      const messages = db.searchChatMessages(query, limit);
      return json(messages);
    }
    
    const messages = db.getChatMessages(projectId || undefined, limit);
    return json(messages);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { role, content, projectId } = await request.json();
    db.saveChatMessage(role, content, projectId);
    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};