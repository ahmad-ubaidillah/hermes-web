import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as db from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const tasks = db.getTasks(params.id);
    return json(tasks);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { title, phase } = await request.json();
    if (!title) {
      return json({ error: 'Title is required' }, { status: 400 });
    }
    const task = db.createTask(params.id, title, phase || 1);
    return json(task, { status: 201 });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};