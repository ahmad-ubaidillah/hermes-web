<script lang="ts">
  import { onMount } from 'svelte';

  let stats: any = $state(null);
  let loading = $state(true);

  async function fetchStats() {
    try {
      const res = await fetch('/api/vps/stats');
      stats = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>VPS - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">VPS Monitoring</h1>
    <button onclick={fetchStats} class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">Refresh</button>
  </div>

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">System Info</h3>
        <div class="space-y-1 text-sm">
          <p><span class="text-slate-500">Hostname:</span> <span class="text-white">{stats?.system?.hostname || 'N/A'}</span></p>
          <p><span class="text-slate-500">CPU:</span> <span class="text-white">{stats?.system?.cpu || 'N/A'}</span></p>
          <p><span class="text-slate-500">Uptime:</span> <span class="text-white">{stats?.system?.uptime || 'N/A'}</span></p>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Memory Usage</h3>
        <div class="w-full bg-slate-700 rounded-full h-4">
          <div class="bg-blue-500 h-4 rounded-full transition-all" style="width: {stats?.memory?.percent || 0}%"></div>
        </div>
        <p class="text-sm mt-2"><span class="text-white">{stats?.memory?.percent || 0}%</span> used</p>
        <p class="text-xs text-slate-500">{Math.round((stats?.memory?.used || 0) / 1024 / 1024)}G / {Math.round((stats?.memory?.total || 0) / 1024 / 1024)}G</p>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Disk Usage</h3>
        {#each stats?.disk || [] as disk}
          <div class="mb-2">
            <p class="text-sm text-white">{disk.mount}</p>
            <div class="w-full bg-slate-700 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: {disk.percent}%"></div>
            </div>
            <p class="text-xs text-slate-500">{disk.used} / {disk.size}</p>
          </div>
        {/each}
        {#if !stats?.disk?.length}
          <p class="text-slate-500">No disks found</p>
        {/if}
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Network</h3>
        <div class="space-y-1 text-sm">
          <p><span class="text-slate-500">IP:</span> <span class="text-white">{stats?.network?.ip || 'N/A'}</span></p>
          <p><span class="text-slate-500">Gateway:</span> <span class="text-white">{stats?.network?.gateway || 'N/A'}</span></p>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Docker</h3>
        <p class="text-2xl font-bold text-white">{stats?.docker?.running || 0}</p>
        <p class="text-sm text-slate-400">containers running</p>
        <p class="text-sm text-slate-500">{stats?.docker?.images || 0} images</p>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Services</h3>
        <div class="space-y-1 max-h-32 overflow-y-auto">
          {#each stats?.services || [] as service}
            <p class="text-sm text-white">{service.name}</p>
          {/each}
          {#if !stats?.services?.length}
            <p class="text-slate-500">No services found</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>