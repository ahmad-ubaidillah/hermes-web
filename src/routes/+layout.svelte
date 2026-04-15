<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';

  let { children } = $props();
  let theme = $state<'dark' | 'light'>('dark');

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
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
    <aside class="w-56 bg-slate-900 border-r border-slate-800 fixed h-full">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h1 class="text-xl font-bold text-blue-400">Hermes</h1>
        <button onclick={toggleTheme} class="p-1 rounded hover:bg-slate-800" title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <nav class="p-2">
        <a href="/" class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Dashboard</a>
        <a href="/vps" class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">VPS</a>
        <a href="/hermes" class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Hermes</a>
        <a href="/projects" class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Projects</a>
        <a href="/chat" class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Chat</a>
        <a href="/settings" class="block px-3 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all">Settings</a>
      </nav>
    </aside>
    <main class="ml-56 flex-1 p-6">
      {@render children()}
    </main>
  </div>
</div>