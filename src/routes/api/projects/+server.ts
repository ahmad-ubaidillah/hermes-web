import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

const MAX_NAME_LENGTH = 100;
const MAX_DESC_LENGTH = 1000;

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
    if (!name || typeof name !== 'string') {
      return json({ error: 'Name is required' }, { status: 400 });
    }
    if (name.length > MAX_NAME_LENGTH) {
      return json({ error: `Name must be ${MAX_NAME_LENGTH} characters or less` }, { status: 400 });
    }
    if (description && typeof description === 'string' && description.length > MAX_DESC_LENGTH) {
      return json({ error: `Description must be ${MAX_DESC_LENGTH} characters or less` }, { status: 400 });
    }
    if (folderPath && typeof folderPath === 'string') {
      const normalized = folderPath.replace(/\0/g, '');
      if (normalized.includes('..')) {
        return json({ error: 'Path traversal not allowed' }, { status: 400 });
      }
    }
    const project = db.createProject(name.trim(), (description && typeof description === 'string') ? description.trim() : '', folderPath || null);
    return json(project, { status: 201 });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};