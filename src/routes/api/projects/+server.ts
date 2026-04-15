import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

export const GET: RequestHandler = async () => {
  try {
    const projects = db.getProjects();
    return json(projects);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name, description, folderPath } = await request.json();
    if (!name) {
      return json({ error: 'Name is required' }, { status: 400 });
    }
    const project = db.createProject(name, description || '', folderPath);
    return json(project, { status: 201 });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};