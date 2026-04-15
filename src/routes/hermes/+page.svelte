<script lang="ts">
  import { onMount } from 'svelte';

  interface HealthStatus {
    status: 'green' | 'yellow' | 'red' | 'unknown';
    issues: string[];
    version: string;
    config: string;
    tools?: string[];
    skills?: number;
  }

  interface VPSCap {
    canRunOllama: boolean;
    canRunvLLM: boolean;
  }

  let health = $state<HealthStatus>({ status: 'unknown', issues: [], version: '', config: '' });
  let vpsCap = $state<VPSCap | null>(null);
  let loading = $state(true);
  let installing = $state(false);
  let loadError = $state('');

  async function fetchData() {
    try {
      const [healthRes, vpsRes] = await Promise.all([
        fetch('/api/hermes/doctor'),
        fetch('/api/vps/capability')
      ]);
      health = await healthRes.json();
      vpsCap = await vpsRes.json();
    } catch {
      loadError = 'Failed to load Hermes data';
    } finally {
      loading = false;
    }
  }

  async function installHermes() {
    installing = true;
    setTimeout(() => {
      installing = false;
    }, 3000);
  }

  onMount(() => {
    fetchData();
  });

  function getStatusColor(status: string) {
    switch(status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  }

  function getStatusText(status: string) {
    switch(status) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'red': return 'text-red-500';
      default: return 'text-slate-400';
    }
  }
</script>

<svelte:head>
  <title>Hermes - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">Hermes Status</h1>
    <button onclick={fetchData} class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">
      Refresh
    </button>
  </div>

  {#if loadError}
    <div class="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">{loadError}</div>
  {/if}

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-800 rounded-lg p-4 border {health.status === 'green' ? 'border-green-600' : health.status === 'yellow' ? 'border-yellow-600' : 'border-red-600'}">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Health</h3>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full {getStatusColor(health.status)}"></span>
          <span class="text-lg font-bold capitalize {getStatusText(health.status)}">{health.status}</span>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Version</h3>
        <p class="text-xl font-bold text-white">{health.version || 'Not Installed'}</p>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Config</h3>
        <p class="text-lg text-white">{health.config || 'Not Configured'}</p>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Local LLM</h3>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full {vpsCap?.canRunOllama ? 'bg-green-500' : 'bg-slate-500'}"></span>
          <span class="text-lg {vpsCap?.canRunOllama ? 'text-green-400' : 'text-slate-400'}">
            {vpsCap?.canRunOllama ? 'Ready' : 'N/A'}
          </span>
        </div>
      </div>
    </div>

    {#if health.issues.length > 0}
      <div class="bg-red-900/30 border border-red-700 rounded-lg p-4">
        <h3 class="text-red-400 font-semibold mb-2">Issues Found:</h3>
        <ul class="space-y-1">
          {#each health.issues as issue}
            <li class="text-red-300">• {issue}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if health.status === 'green'}
      <div class="bg-green-900/30 border border-green-700 rounded-lg p-4">
        <p class="text-green-400">✓ Hermes is healthy and ready to use!</p>
      </div>
    {/if}

    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <a href="/settings" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition">
          Settings
        </a>
        <a href="/projects" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition">
          New Project
        </a>
        <a href="/chat" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition">
          Start Chat
        </a>
        <button 
          onclick={installHermes}
          disabled={installing}
          class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded text-white transition"
        >
          {installing ? 'Installing...' : 'Install Hermes'}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-white font-semibold mb-2">Tools</h3>
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">Web Search</span>
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">Browser</span>
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">Terminal</span>
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">Code</span>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-white font-semibold mb-2">Gateways</h3>
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">CLI</span>
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">Telegram</span>
          <span class="px-2 py-1 bg-slate-600 rounded text-sm text-slate-300">Discord</span>
        </div>
      </div>
    </div>
  {/if}
</div>