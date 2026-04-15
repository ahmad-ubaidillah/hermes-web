import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as rag from '$lib/server/rag';
import * as db from '$lib/server/db';

export const POST: RequestHandler = async ({ params }) => {
  try {
    const project = db.getProject(params.id);
    if (!project || !project.folder_path) {
      return json({ error: 'Project not found or no folder path' }, { status: 400 });
    }
    
    const index = await rag.indexProjectFolder(params.id, project.folder_path);
    return json(index);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ params }) => {
  try {
    const index = await rag.getProjectIndex(params.id);
    if (!index) {
      return json({ error: 'Project not indexed' }, { status: 404 });
    }
    return json(index);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};