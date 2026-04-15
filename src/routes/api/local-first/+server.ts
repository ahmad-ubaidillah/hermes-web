import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as localFirst from '$lib/server/local-first';

export const GET: RequestHandler = async () => {
  try {
    const services = await localFirst.detectLocalFirstServices();
    const config = await localFirst.getCurrentLLMConfig();
    return json({ services, currentConfig: config });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};