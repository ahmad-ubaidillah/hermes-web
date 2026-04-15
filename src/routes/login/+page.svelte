<script lang="ts">
  import { goto } from '$app/navigation';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin() {
    if (!username || !password) {
      error = 'Please enter username and password';
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Login failed';
        return;
      }

      goto('/');
    } catch (e: any) {
      error = e.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Hermes Web UI</title>
</svelte:head>

<div class="min-h-screen bg-slate-900 flex items-center justify-center">
  <div class="w-full max-w-md p-8 bg-slate-800 rounded-lg border border-slate-700">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-400">Hermes Web UI</h1>
      <p class="text-slate-400 mt-2">Login to continue</p>
    </div>

    {#if error}
      <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
        {error}
      </div>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="space-y-4">
      <div>
        <label class="block text-sm text-slate-400 mb-1">Username</label>
        <input
          type="text"
          bind:value={username}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          placeholder="admin"
        />
      </div>

      <div>
        <label class="block text-sm text-slate-400 mb-1">Password</label>
        <input
          type="password"
          bind:value={password}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white transition"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <p class="text-center text-slate-500 text-sm mt-4">
      Default: admin / hermes123
    </p>
  </div>
</div>