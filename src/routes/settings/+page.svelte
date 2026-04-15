<script lang="ts">
  import { onMount } from 'svelte';

  interface VPSCapability {
    canRunOllama: boolean;
    canRunvLLM: boolean;
    canRunDocker: boolean;
    ramGB: number;
    cpuCores: number;
    gpuAvailable: boolean;
    recommendations: string[];
    ollama: { running: boolean; models: string[] };
  }

  let activeTab = $state<'general' | 'local' | 'vps' | 'modules' | 'widgets'>('general');
  let apiProvider = $state('openai');
  let apiKey = $state('');
  let port = $state(3000);
  
  let vpsCap = $state<VPSCapability | null>(null);
  let localFirst = $state<any>({ services: {}, currentConfig: '' });
  let loading = $state(true);

  async function fetchData() {
    try {
      const [vpsRes, localRes] = await Promise.all([
        fetch('/api/vps/capability'),
        fetch('/api/local-first')
      ]);
      vpsCap = await vpsRes.json();
      localFirst = await localRes.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchData();
  });
</script>

<svelte:head>
  <title>Settings - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <h1 class="text-2xl font-bold text-white">Settings</h1>

  <div class="flex gap-2 border-b border-slate-700 overflow-x-auto">
    <button 
      onclick={() => activeTab = 'general'} 
      class="px-4 py-2 whitespace-nowrap {activeTab === 'general' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400'}">
      General
    </button>
    <button 
      onclick={() => activeTab = 'local'} 
      class="px-4 py-2 whitespace-nowrap {activeTab === 'local' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400'}">
      Local-First
    </button>
    <button 
      onclick={() => activeTab = 'vps'} 
      class="px-4 py-2 whitespace-nowrap {activeTab === 'vps' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400'}">
      VPS Info
    </button>
    <button 
      onclick={() => activeTab = 'modules'} 
      class="px-4 py-2 whitespace-nowrap {activeTab === 'modules' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400'}">
      Modules
    </button>
    <a 
      href="/settings/widgets"
      class="px-4 py-2 whitespace-nowrap text-slate-400 hover:text-white"
    >
      Widgets
    </a>
    <a 
      href="/settings/logs"
      class="px-4 py-2 whitespace-nowrap text-slate-400 hover:text-white"
    >
      Logs
    </a>
    <a 
      href="/settings/password"
      class="px-4 py-2 whitespace-nowrap text-slate-400 hover:text-white"
    >
      Password
    </a>
  </div>

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else if activeTab === 'general'}
    <div class="space-y-6">
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 class="text-lg font-semibold text-white mb-4">Hermes Configuration</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">AI Provider</label>
            <select bind:value={apiProvider} class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-1">API Key</label>
            <input 
              type="password" 
              bind:value={apiKey} 
              placeholder="Enter API key"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 class="text-lg font-semibold text-white mb-4">Server Configuration</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-1">Port</label>
            <input 
              type="number" 
              bind:value={port} 
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === 'local'}
    <div class="space-y-6">
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 class="text-lg font-semibold text-white mb-4">Local-First Options</h2>
        <p class="text-slate-400 text-sm mb-4">Pilih opsi tanpa API key untuk privacy dan cost hemat</p>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-slate-700 rounded">
            <div>
              <p class="text-white font-medium">Ollama (Local LLM)</p>
              <p class="text-slate-400 text-sm">Tanpa API key - berjalan di lokal</p>
            </div>
            <span class="px-2 py-1 rounded text-sm {vpsCap?.canRunOllama ? 'bg-green-600' : 'bg-red-600'}">
              {vpsCap?.canRunOllama ? 'Ready' : 'Not Ready'}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-700 rounded">
            <div>
              <p class="text-white font-medium">SearXNG (Web Search)</p>
              <p class="text-slate-400 text-sm">Self-hosted search engine</p>
            </div>
            <span class="px-2 py-1 rounded text-sm {localFirst.services?.searxng?.running ? 'bg-green-600' : 'bg-slate-600'}">
              {localFirst.services?.searxng?.running ? 'Running' : 'Not Running'}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-700 rounded">
            <div>
              <p class="text-white font-medium">Crawl4AI (Web Crawl)</p>
              <p class="text-slate-400 text-sm">Self-hosted web crawler</p>
            </div>
            <span class="px-2 py-1 rounded text-sm {localFirst.services?.crawl4ai?.running ? 'bg-green-600' : 'bg-slate-600'}">
              {localFirst.services?.crawl4ai?.running ? 'Running' : 'Not Running'}
            </span>
          </div>
        </div>
        
        {#if vpsCap?.canRunOllama && localFirst.services?.ollama?.running}
          <div class="mt-4 p-3 bg-green-900/30 border border-green-700 rounded">
            <p class="text-green-400 font-medium">Ollama Running!</p>
            <p class="text-slate-400 text-sm">Models: {localFirst.services?.ollama?.models?.join(', ') || 'None'}</p>
          </div>
        {/if}
      </div>

      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 class="text-lg font-semibold text-white mb-4">Quick Setup</h2>
        <div class="space-y-3">
          <a href="https://ollama.ai" target="_blank" class="block px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-center text-white">
            Install Ollama →
          </a>
          <button class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
            Setup Ollama in Hermes
          </button>
        </div>
      </div>
    </div>
  {:else if activeTab === 'vps'}
    <div class="space-y-6">
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h2 class="text-lg font-semibold text-white mb-4">VPS Capability Check</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="text-center p-3 bg-slate-700 rounded">
            <p class="text-2xl font-bold text-white">{vpsCap?.ramGB || 0}GB</p>
            <p class="text-slate-400 text-sm">RAM</p>
          </div>
          <div class="text-center p-3 bg-slate-700 rounded">
            <p class="text-2xl font-bold text-white">{vpsCap?.cpuCores || 0}</p>
            <p class="text-slate-400 text-sm">CPU Cores</p>
          </div>
          <div class="text-center p-3 bg-slate-700 rounded">
            <p class="text-2xl font-bold {vpsCap?.gpuAvailable ? 'text-green-400' : 'text-slate-400'}">
              {vpsCap?.gpuAvailable ? 'Yes' : 'No'}
            </p>
            <p class="text-slate-400 text-sm">GPU</p>
          </div>
          <div class="text-center p-3 bg-slate-700 rounded">
            <p class="text-2xl font-bold {vpsCap?.canRunDocker ? 'text-green-400' : 'text-red-400'}">
              {vpsCap?.canRunDocker ? 'Yes' : 'No'}
            </p>
            <p class="text-slate-400 text-sm">Docker</p>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between p-3 bg-slate-700 rounded">
            <span class="text-white">Can Run Ollama</span>
            <span class="px-2 py-1 rounded text-sm {vpsCap?.canRunOllama ? 'bg-green-600' : 'bg-red-600'}">
              {vpsCap?.canRunOllama ? '✓' : '✗'}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-slate-700 rounded">
            <span class="text-white">Can Run vLLM</span>
            <span class="px-2 py-1 rounded text-sm {vpsCap?.canRunvLLM ? 'bg-green-600' : 'bg-slate-600'}">
              {vpsCap?.canRunvLLM ? '✓' : '✗'}
            </span>
          </div>
        </div>

        {#if vpsCap?.recommendations?.length}
          <div class="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
            <p class="text-yellow-400 font-medium mb-2">Recommendations:</p>
            <ul class="text-slate-300 text-sm space-y-1">
              {#each vpsCap.recommendations as rec}
                <li>• {rec}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {:else if activeTab === 'modules'}
    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-lg font-semibold text-white mb-4">Module Installation</h2>
      <p class="text-slate-400 mb-4">Install modules dari awesome-hermes-agent</p>
      
      <div class="space-y-3">
        <div class="p-3 bg-slate-700 rounded">
          <p class="text-white font-medium">wondelai/skills</p>
          <p class="text-slate-400 text-sm">Cross-platform agent skills</p>
        </div>
        <div class="p-3 bg-slate-700 rounded">
          <p class="text-white font-medium">hermes-workspace</p>
          <p class="text-slate-400 text-sm">Web UI untuk Hermes</p>
        </div>
        <div class="p-3 bg-slate-700 rounded">
          <p class="text-white font-medium">mission-control</p>
          <p class="text-slate-400 text-sm">Agent fleet management</p>
        </div>
        <div class="p-3 bg-slate-700 rounded">
          <p class="text-white font-medium">hindsight</p>
          <p class="text-slate-400 text-sm">Long-term memory layer (self-hosted)</p>
        </div>
      </div>
      
      <button class="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
        Browse All Modules →
      </button>
    </div>
  {/if}
</div>