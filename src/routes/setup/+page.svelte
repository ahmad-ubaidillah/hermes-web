<script lang="ts">
  import { onMount } from 'svelte';

  interface HermesStatus {
    installed: boolean;
    version: string;
    canInstall: boolean;
    canUpdate: boolean;
  }

  let status = $state<HermesStatus>({ installed: false, version: '', canInstall: true, canUpdate: false });
  let loading = $state(true);
  let installing = $state(false);
  let setupRunning = $state(false);
  let output = $state('');
  let progress = $state(0);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/hermes/install');
      status = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function installHermes() {
    installing = true;
    progress = 10;
    output = 'Starting installation...\n';
    
    try {
      const res = await fetch('/api/hermes/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'install' })
      });
      
      const data = await res.json();
      progress = 100;
      
      if (data.success) {
        output = data.output || 'Installation complete!';
        await fetchStatus();
      } else {
        output = data.error || 'Installation failed';
      }
    } catch (e: any) {
      output = e.message || 'Installation failed';
    } finally {
      installing = false;
    }
  }

  async function runSetup() {
    setupRunning = true;
    output = 'Running setup wizard...\n';
    
    try {
      const res = await fetch('/api/hermes/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' })
      });
      
      const data = await res.json();
      output = data.message || 'Setup complete!';
    } catch (e: any) {
      output = e.message || 'Setup failed';
    } finally {
      setupRunning = false;
    }
  }

  async function runDoctor() {
    output = 'Running hermes doctor...\n';
    
    try {
      const res = await fetch('/api/hermes/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'doctor' })
      });
      
      const data = await res.json();
      output = data.output || 'Check complete';
    } catch (e: any) {
      output = e.message || 'Doctor check failed';
    }
  }

  onMount(() => {
    fetchStatus();
  });
</script>

<svelte:head>
  <title>Hermes Setup - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">Hermes Setup</h1>
    <button onclick={fetchStatus} class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">Refresh</button>
  </div>

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Status</h3>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full {status.installed ? 'bg-green-500' : 'bg-red-500'}"></span>
          <span class="text-lg {status.installed ? 'text-green-400' : 'text-red-400'}">
            {status.installed ? 'Installed' : 'Not Installed'}
          </span>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Version</h3>
        <p class="text-xl font-bold text-white">{status.version || 'N/A'}</p>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm uppercase mb-2">Can Update</h3>
        <p class="text-xl font-bold text-white">{status.canUpdate ? 'Yes' : 'No'}</p>
      </div>
    </div>

    {#if !status.installed}
      <div class="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
        <p class="text-yellow-400">Hermes is not installed. Click Install to get started.</p>
      </div>
    {/if}

    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-xl font-semibold text-white mb-4">Actions</h2>
      
      {#if installing}
        <div class="mb-4">
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: {progress}%"></div>
          </div>
          <p class="text-sm text-slate-400 mt-1">{progress}% complete</p>
        </div>
      {/if}

      <div class="flex flex-wrap gap-3">
        <button 
          onclick={installHermes}
          disabled={installing}
          class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded text-white"
        >
          {installing ? 'Installing...' : 'Install Hermes'}
        </button>
        
        <button 
          onclick={runSetup}
          disabled={!status.installed || setupRunning}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white"
        >
          {setupRunning ? 'Running...' : 'Run Setup Wizard'}
        </button>
        
        <button 
          onclick={runDoctor}
          disabled={!status.installed}
          class="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 rounded text-white"
        >
          Run Doctor
        </button>
      </div>
    </div>

    {#if output}
      <div class="bg-slate-950 rounded-lg p-4 border border-slate-700">
        <h3 class="text-slate-400 text-sm mb-2">Output</h3>
        <pre class="text-green-400 text-sm whitespace-pre-wrap">{output}</pre>
      </div>
    {/if}

    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-xl font-semibold text-white mb-4">Quick Start Guide</h2>
      <ol class="list-decimal list-inside space-y-2 text-slate-300">
        <li>Klik <strong class="text-white">Install Hermes</strong> untuk install hermes-agent</li>
        <li>Klik <strong class="text-white">Run Setup Wizard</strong> untuk configure model, API key, dll</li>
        <li>Bisa juga手动 dengan <code class="bg-slate-700 px-2 py-1 rounded">hermes setup</code> di terminal</li>
      </ol>
    </div>
  {/if}
</div>