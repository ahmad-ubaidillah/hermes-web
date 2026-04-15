import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

const MAX_TITLE_LENGTH = 200;

export const GET: RequestHandler = async ({ params }) => {
  try {
    const project = db.getProject(params.id);
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    const tasks = db.getTasks(params.id);
    return json(tasks);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { title, phase } = await request.json();
    if (!title || typeof title !== 'string') {
      return json({ error: 'Title is required' }, { status: 400 });
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or less` }, { status: 400 });
    }
    if (phase !== undefined && (typeof phase !== 'number' || phase < 1)) {
      return json({ error: 'Phase must be a positive number' }, { status: 400 });
    }
    const project = db.getProject(params.id);
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    const task = db.createTask(params.id, title.trim(), phase || 1);
    return json(task, { status: 201 });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { taskId, status, title, phase } = await request.json();
    if (!taskId) {
      return json({ error: 'taskId is required' }, { status: 400 });
    }
    if (status && typeof status !== 'string') {
      return json({ error: 'Status must be a string' }, { status: 400 });
    }
    if (title && typeof title === 'string' && title.length > MAX_TITLE_LENGTH) {
      return json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or less` }, { status: 400 });
    }
    db.updateTask(taskId, { ...(status && { status }), ...(title && { title: title.trim() }), ...(phase && { phase }) });
    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { taskId } = await request.json();
    if (!taskId) {
      return json({ error: 'taskId is required' }, { status: 400 });
    }
    db.deleteTask(taskId);
    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};