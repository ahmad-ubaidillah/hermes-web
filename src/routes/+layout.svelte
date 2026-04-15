<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';

  let { children } = $props();
  let theme = $state<'dark' | 'light'>('dark');
  let sidebarOpen = $state(false);

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }

  let toastMessage = $state('');
  let toastType = $state<'success' | 'error' | 'info' | 'warning'>('info');
  let toastVisible = $state(false);
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    toastMessage = message;
    toastType = type;
    toastVisible = true;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toastVisible = false; }, 4000);
  }

  onMount(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      theme = saved;
    }
  });
</script>

<div class="{theme === 'dark' ? 'dark' : ''}">
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <button onclick={() => sidebarOpen = !sidebarOpen} class="md:hidden fixed top-4 left-4 z-40 p-2 bg-slate-800 border border-slate-700 rounded-lg">
      <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <aside class="w-56 bg-slate-900 border-r border-slate-800 fixed h-full z-30 transform transition-transform md:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h1 class="text-xl font-bold text-blue-400">Hermes</h1>
        <button onclick={toggleTheme} class="p-1 rounded hover:bg-slate-800" title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <nav class="p-2">
        <a href="/" onclick={() => sidebarOpen = false} class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Dashboard</a>
        <a href="/vps" onclick={() => sidebarOpen = false} class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">VPS</a>
        <a href="/hermes" onclick={() => sidebarOpen = false} class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Hermes</a>
        <a href="/projects" onclick={() => sidebarOpen = false} class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Projects</a>
        <a href="/chat" onclick={() => sidebarOpen = false} class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Chat</a>
        <a href="/settings" onclick={() => sidebarOpen = false} class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Settings</a>
      </nav>
    </aside>

    {#if sidebarOpen}
      <button onclick={() => sidebarOpen = false} class="md:hidden fixed inset-0 z-20 bg-black/50"></button>
    {/if}

    <main class="md:ml-56 flex-1 p-6 pt-16 md:pt-6">
      {@render children()}
    </main>

    {#if toastVisible}
      <div class="fixed top-4 right-4 z-50 animate-slide-in">
        <div class="p-4 rounded-lg shadow-lg max-w-sm {
              toastType === 'success' ? 'bg-green-600' :
              toastType === 'error' ? 'bg-red-600' :
              toastType === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
            }">
          <div class="flex items-center justify-between gap-2">
            <span class="text-white text-sm">{toastMessage}</span>
            <button onclick={() => toastVisible = false} class="text-white/70 hover:text-white">✕</button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
</style>