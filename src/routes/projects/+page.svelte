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

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      projects = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function fetchTasks(projectId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      tasks = await res.json();
    } catch (e) {
      console.error(e);
    }
  }

  async function selectProject(project: Project) {
    selectedProject = project;
    await fetchTasks(project.id);
  }

  async function createProject() {
    if (!newProject.name) return;
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      newProject = { name: '', description: '', folderPath: '' };
      showForm = false;
      await fetchProjects();
    } catch (e) {
      console.error(e);
    }
  }

  async function createTask() {
    if (!selectedProject) return;
    try {
      await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Task', phase: 1 })
      });
      await fetchTasks(selectedProject.id);
    } catch (e) {
      console.error(e);
    }
  }

  function calculatePercentage(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }

  function getTasksByStatus(tasks: Task[], status: string) {
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

  {#if showForm}
    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-lg font-semibold text-white mb-4">Create Project</h2>
      <div class="space-y-3">
        <input
          type="text"
          placeholder="Project name"
          bind:value={newProject.name}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
        />
        <input
          type="text"
          placeholder="Description"
          bind:value={newProject.description}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
        />
        <input
          type="text"
          placeholder="Folder path (optional)"
          bind:value={newProject.folderPath}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
        />
        <button onclick={createProject} class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition">Create</button>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else if projects.length === 0}
    <div class="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
      <p class="text-slate-400">No projects yet. Create one to get started.</p>
    </div>
  {:else if selectedProject}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <button onclick={() => selectedProject = null} class="text-blue-400 hover:text-blue-300">
          ← Back to Projects
        </button>
        <div class="text-right">
          <p class="text-white font-medium">{selectedProject.name}</p>
          <p class="text-sm text-slate-400">{calculatePercentage(tasks)}% complete</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 class="text-blue-400 font-semibold mb-3">To Do ({getTasksByStatus(tasks, 'todo').length})</h3>
          <div class="space-y-2">
            {#each getTasksByStatus(tasks, 'todo') as task}
              <div class="p-2 bg-slate-700 rounded text-sm text-white">{task.title}</div>
            {/each}
          </div>
        </div>

        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 class="text-yellow-400 font-semibold mb-3">In Progress ({getTasksByStatus(tasks, 'in_progress').length})</h3>
          <div class="space-y-2">
            {#each getTasksByStatus(tasks, 'in_progress') as task}
              <div class="p-2 bg-slate-700 rounded text-sm text-white">{task.title}</div>
            {/each}
          </div>
        </div>

        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 class="text-green-400 font-semibold mb-3">Done ({getTasksByStatus(tasks, 'done').length})</h3>
          <div class="space-y-2">
            {#each getTasksByStatus(tasks, 'done') as task}
              <div class="p-2 bg-slate-700 rounded text-sm text-green-300 line-through">{task.title}</div>
            {/each}
          </div>
        </div>
      </div>

      <button onclick={createTask} class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white">
        + Add Task
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each projects as project}
        <button 
          onclick={() => selectProject(project)}
          class="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition text-left"
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