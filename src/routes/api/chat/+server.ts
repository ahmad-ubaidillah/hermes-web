import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as hermes from '$lib/server/hermes-cli';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, context } = await request.json();
    
    if (!message) {
      return json({ error: 'Message is required' }, { status: 400 });
    }
    
    const response = await hermes.chatWithHermes(message, context);
    return json({ response });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  try {
    const status = await hermes.checkHermesCLI();
    return json(status);
  } catch (error) {
    return json({ installed: false, version: '', error: String(error) });
  }
};