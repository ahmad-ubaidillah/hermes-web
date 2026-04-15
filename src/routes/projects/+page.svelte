<script lang="ts">
  import { onMount } from 'svelte';

  interface Task {
    id: string;
    project_id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    phase: number;
  }

  interface Project {
    id: string;
    name: string;
    description: string;
    folder_path: string | null;
    stack: string | null;
    percentage: number;
    created_at: string;
  }

  let projects: Project[] = $state([]);
  let selectedProject = $state<Project | null>(null);
  let tasks = $state<Task[]>([]);
  let loading = $state(true);
  let showForm = $state(false);
  let newProject = $state({ name: '', description: '', folderPath: '' });
  let newTaskTitle = $state('');
  let draggedTask: Task | null = $state(null);
  let error = $state('');
  let deletingId = $state<string | null>(null);

  const COLUMNS: { key: Task['status']; label: string; color: string; bgColor: string }[] = [
    { key: 'todo', label: 'To Do', color: 'text-blue-400', bgColor: 'border-blue-600' },
    { key: 'in_progress', label: 'In Progress', color: 'text-yellow-400', bgColor: 'border-yellow-600' },
    { key: 'done', label: 'Done', color: 'text-green-400', bgColor: 'border-green-600' },
  ];

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      projects = await res.json();
    } catch (e) {
      error = 'Failed to load projects';
    } finally {
      loading = false;
    }
  }

  async function fetchTasks(projectId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      tasks = await res.json();
    } catch (e) {
      error = 'Failed to load tasks';
    }
  }

  async function selectProject(project: Project) {
    selectedProject = project;
    error = '';
    await fetchTasks(project.id);
  }

  async function createProject() {
    if (!newProject.name.trim()) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProject.name.trim(), description: newProject.description.trim(), folderPath: newProject.folderPath.trim() || undefined })
      });
      if (!res.ok) {
        const data = await res.json();
        error = data.error || 'Failed to create project';
        return;
      }
      newProject = { name: '', description: '', folderPath: '' };
      showForm = false;
      await fetchProjects();
    } catch (e) {
      error = 'Failed to create project';
    }
  }

  async function createTask() {
    if (!selectedProject || !newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim(), phase: 1 })
      });
      if (res.ok) {
        newTaskTitle = '';
        await fetchTasks(selectedProject.id);
      }
    } catch (e) {
      error = 'Failed to create task';
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
    try {
      const res = await fetch(`/api/projects/${selectedProject!.id}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      });
      if (res.ok) {
        await fetchTasks(selectedProject!.id);
      }
    } catch (e) {
      error = 'Failed to move task';
    }
  }

  async function deleteTask(taskId: string) {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        await fetchTasks(selectedProject.id);
      }
    } catch (e) {
      error = 'Failed to delete task';
    }
  }

  function onDragStart(task: Task) {
    draggedTask = task;
  }

  function onDrop(status: Task['status']) {
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
    }
    draggedTask = null;
  }

  function calculatePercentage(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }

  function getTasksByStatus(status: string) {
    return tasks.filter(t => t.status === status);
  }

  onMount(() => {
    fetchProjects();
  });
</script>

<svelte:head>
  <title>Projects - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">Projects</h1>
    <button onclick={() => showForm = !showForm} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition">
      {showForm ? 'Cancel' : 'New Project'}
    </button>
  </div>

  {#if error}
    <div class="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-sm">{error}</div>
  {/if}

  {#if showForm}
    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-lg font-semibold text-white mb-4">Create Project</h2>
      <div class="space-y-3">
        <input type="text" placeholder="Project name" bind:value={newProject.name} maxlength="100" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400" />
        <textarea placeholder="Description" bind:value={newProject.description} maxlength="1000" rows="2" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 resize-none"></textarea>
        <input type="text" placeholder="Folder path (optional)" bind:value={newProject.folderPath} class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400" />
        <button onclick={createProject} disabled={!newProject.name.trim()} class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded text-white transition">Create</button>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-3 text-slate-400">Loading projects...</span>
    </div>
  {:else if projects.length === 0}
    <div class="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
      <p class="text-slate-400 text-lg">No projects yet</p>
      <p class="text-slate-500 text-sm mt-2">Create a project to get started</p>
    </div>
  {:else if selectedProject}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <button onclick={() => selectedProject = null} class="text-blue-400 hover:text-blue-300">
          ← Back to Projects
        </button>
        <div class="text-right">
          <p class="text-white font-medium">{selectedProject.name}</p>
          <p class="text-sm text-slate-400">{calculatePercentage(tasks)}% complete ({tasks.filter(t => t.status === 'done').length}/{tasks.length} tasks)</p>
        </div>
      </div>

      <div class="bg-slate-800/50 rounded-lg p-1 mb-2">
        <div class="w-full bg-slate-700 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: {calculatePercentage(tasks)}%"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each COLUMNS as column}
          <div class="bg-slate-800/50 rounded-lg p-4 border {column.bgColor} min-h-[200px]"
               ondragover="{(e: DragEvent) => e.preventDefault()}"
               ondrop={() => onDrop(column.key)}>
            <h3 class="{column.color} font-semibold mb-3">
              {column.label} ({getTasksByStatus(column.key).length})
            </h3>
            <div class="space-y-2">
              {#each getTasksByStatus(column.key) as task}
                <div class="p-2 bg-slate-700 rounded text-sm text-white cursor-grab hover:bg-slate-600 transition group"
                     draggable="true"
                     ondragstart={() => onDragStart(task)}>
                  <div class="flex justify-between items-center">
                    <span>{task.title}</span>
                    <button onclick={() => deleteTask(task.id)} class="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs">✕</button>
                  </div>
                </div>
              {/each}
              {#if getTasksByStatus(column.key).length === 0}
                <div class="text-slate-500 text-sm text-center py-4">Drop tasks here</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="flex gap-2">
        <input type="text" placeholder="Add a task..." bind:value={newTaskTitle} onkeydown={(e) => e.key === 'Enter' && createTask()} class="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400" />
        <button onclick={createTask} disabled={!newTaskTitle.trim()} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white transition">
          Add
        </button>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each projects as project}
        <button
          onclick={() => selectProject(project)}
          class="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-600 transition text-left"
        >
          <h3 class="text-lg font-semibold text-white">{project.name}</h3>
          <p class="text-sm text-slate-400 mt-1">{project.description || 'No description'}</p>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-sm text-blue-400">{project.percentage}%</span>
            <span class="text-xs text-slate-500">{project.stack || 'Unknown stack'}</span>
          </div>
          <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: {project.percentage}%"></div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>