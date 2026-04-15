<script lang="ts">
  import { onMount } from 'svelte';

  let stats: any = $state(null);
  let loading = $state(true);
  let sseConnected = $state(false);
  let reconnectAttempts = $state(0);
  let sparklineData: { cpu: number[]; memory: number[] } = $state({ cpu: [], memory: [] });
  const MAX_SPARKLINE_POINTS = 30;

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

  function startSSE() {
    const eventSource = new EventSource('/api/vps/stream');
    
    eventSource.onopen = () => {
      sseConnected = true;
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'metrics') {
          stats = { ...stats, memory: data.memory, docker: data.docker, cpuData: data.cpu };
          const cpuPoint = data.cpu ?? 0;
          const memPoint = data.memory?.percent ?? 0;
          sparklineData.cpu = [...sparklineData.cpu.slice(-(MAX_SPARKLINE_POINTS - 1)), cpuPoint];
          sparklineData.memory = [...sparklineData.memory.slice(-(MAX_SPARKLINE_POINTS - 1)), memPoint];
          try {
            localStorage.setItem('vps_sparkline', JSON.stringify(sparklineData));
          } catch {}
        }
      } catch {}
    };

    eventSource.onerror = () => {
      sseConnected = false;
      eventSource.close();
      const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60000);
      reconnectAttempts++;
      setTimeout(startSSE, delay);
    };

    return eventSource;
  }

  function sparklinePath(data: number[]): string {
    if (data.length < 2) return '';
    const w = 120;
    const h = 30;
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }

  onMount(() => {
    fetchStats();
    try {
      const saved = localStorage.getItem('vps_sparkline');
      if (saved) sparklineData = JSON.parse(saved);
    } catch {}
    startSSE();
    return () => {};
  });
</script>

<svelte:head>
  <title>VPS - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">VPS Monitoring</h1>
    <div class="flex items-center gap-3">
      <span class="flex items-center gap-1.5 text-xs {sseConnected ? 'text-green-400' : 'text-red-400'}">
        <span class="w-1.5 h-1.5 rounded-full {sseConnected ? 'bg-green-500' : 'bg-red-500'}"></span>
        {sseConnected ? 'Live' : 'Disconnected'}
      </span>
      <button onclick={fetchStats} class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">Refresh</button>
    </div>
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
        {#if sparklineData.memory.length > 1}
          <svg viewBox="0 0 120 30" class="w-full h-8 mt-2" preserveAspectRatio="none">
            <path d={sparklinePath(sparklineData.memory)} fill="none" stroke="#3b82f6" stroke-width="1.5"/>
          </svg>
        {/if}
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">CPU Load</h3>
        <p class="text-2xl font-bold text-white">{stats?.cpuData?.toFixed(2) || 'N/A'}</p>
        {#if sparklineData.cpu.length > 1}
          <svg viewBox="0 0 120 30" class="w-full h-8 mt-2" preserveAspectRatio="none">
            <path d={sparklinePath(sparklineData.cpu)} fill="none" stroke="#22c55e" stroke-width="1.5"/>
          </svg>
        {/if}
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