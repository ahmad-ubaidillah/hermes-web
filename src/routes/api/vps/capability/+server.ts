import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as vpsCapability from '$lib/server/vps-capability';

export const GET: RequestHandler = async () => {
  try {
    const capability = await vpsCapability.checkVPSCapability();
    const ollama = await vpsCapability.checkOllamaRunning();
    return json({ ...capability, ollama });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};