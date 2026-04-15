<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error - Hermes Web UI</title>
</svelte:head>

<div class="min-h-[50vh] flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-slate-600">{$page.status}</h1>
    <p class="text-xl text-slate-400 mt-4">
      {$page.status === 404 ? 'Page not found' : $page.error?.message || 'Something went wrong'}
    </p>
    <a href="/" class="mt-6 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition">
      Go to Dashboard
    </a>
  </div>
</div>