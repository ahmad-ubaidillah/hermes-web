<script lang="ts">
  import { onMount } from 'svelte';

  interface Log {
    id: string;
    user_id: string;
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
  }

  let logs = $state<Log[]>([]);
  let loading = $state(true);
  let loadError = $state('');

  async function fetchLogs() {
    try {
      const res = await fetch('/api/admin/logs?limit=100');
      logs = await res.json();
    } catch {
      loadError = 'Failed to load activity logs';
    } finally {
      loading = false;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  onMount(() => {
    fetchLogs();
  });
</script>

<svelte:head>
  <title>Activity Logs - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">Activity Logs</h1>
    <button onclick={fetchLogs} class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else if logs.length === 0}
    <div class="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
      <p class="text-slate-400">No activity logs yet.</p>
    </div>
  {:else}
    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-700">
          <tr>
            <th class="px-4 py-2 text-left text-slate-300">Time</th>
            <th class="px-4 py-2 text-left text-slate-300">Action</th>
            <th class="px-4 py-2 text-left text-slate-300">Details</th>
            <th class="px-4 py-2 text-left text-slate-300">IP</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as log}
            <tr class="border-t border-slate-700">
              <td class="px-4 py-2 text-slate-400 text-sm">{formatDate(log.created_at)}</td>
              <td class="px-4 py-2 text-white">{log.action}</td>
              <td class="px-4 py-2 text-slate-400">{log.details || '-'}</td>
              <td class="px-4 py-2 text-slate-400 text-sm">{log.ip_address || '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>