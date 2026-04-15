<script lang="ts">
  import { onMount } from 'svelte';

  let hermesStatus = $state({ status: 'unknown', issues: [] as string[] });
  let projects: any[] = $state([]);
  let vpsStats: any = $state(null);

  onMount(async () => {
    try {
      const [hermesRes, projectsRes, vpsRes] = await Promise.all([
        fetch('/api/hermes/doctor'),
        fetch('/api/projects'),
        fetch('/api/vps/stats')
      ]);
      hermesStatus = await hermesRes.json();
      projects = await projectsRes.json();
      vpsStats = await vpsRes.json();
    } catch (e) {
      console.error(e);
    }
  });
</script>

<svelte:head>
  <title>Hermes Web UI - Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-white mb-2">Welcome to Hermes Web UI</h1>
    <p class="text-slate-400">Manage your Hermes Agent from here</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 class="text-slate-400 text-sm uppercase">Hermes Status</h3>
      <div class="mt-2 flex items-center gap-2">
        <span class="w-3 h-3 rounded-full {hermesStatus.status === 'green' ? 'bg-green-500' : hermesStatus.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}"></span>
        <span class="text-lg font-medium {hermesStatus.status === 'green' ? 'text-green-500' : hermesStatus.status === 'yellow' ? 'text-yellow-500' : 'text-red-500'} capitalize">{hermesStatus.status}</span>
      </div>
      {#if hermesStatus.issues.length > 0}
        <ul class="mt-2 text-sm text-slate-400">
          {#each hermesStatus.issues as issue}
            <li class="text-red-400">• {issue}</li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 class="text-slate-400 text-sm uppercase">Active Projects</h3>
      <p class="text-3xl font-bold text-white mt-2">{Array.isArray(projects) ? projects.length : 0}</p>
    </div>

    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 class="text-slate-400 text-sm uppercase">System Load</h3>
      <p class="text-3xl font-bold text-white mt-2">{vpsStats?.memory?.percent || '--'}%</p>
      <p class="text-sm text-slate-400">Memory</p>
    </div>
  </div>

  <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
    <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
    <div class="flex flex-wrap gap-3">
      <a href="/hermes" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition">Run Hermes Doctor</a>
      <a href="/projects" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition">New Project</a>
      <a href="/settings" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition">Settings</a>
    </div>
  </div>
</div>