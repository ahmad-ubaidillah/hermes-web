<script lang="ts">
  import { goto } from '$app/navigation';

  let step = $state<'request' | 'recovery'>('request');
  let recoveryCode = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let message = $state('');
  let loading = $state(false);

  async function requestRecovery() {
    step = 'recovery';
  }

  async function resetPassword() {
    if (!recoveryCode || !newPassword || !confirmPassword) {
      error = 'All fields are required';
      return;
    }
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    if (newPassword.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: recoveryCode })
      });

      if (!res.ok) {
        error = 'Invalid recovery code. Contact your server administrator.';
        loading = false;
        return;
      }

      message = 'Recovery code accepted. Please contact your server administrator to set a new password, or use the password change page after logging in.';
    } catch (e: any) {
      error = e.message || 'Recovery failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Forgot Password - Hermes Web UI</title>
</svelte:head>

<div class="min-h-screen bg-slate-900 flex items-center justify-center">
  <div class="w-full max-w-md p-8 bg-slate-800 rounded-lg border border-slate-700">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-blue-400">Forgot Password</h1>
      <p class="text-slate-400 mt-2">Reset your admin password</p>
    </div>

    {#if error}
      <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400">
        {error}
      </div>
    {/if}

    {#if message}
      <div class="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-green-400">
        {message}
      </div>
      <a href="/login" class="block text-center text-blue-400 hover:underline">
        Go to Login
      </a>
    {:else if step === 'request'}
      <div class="space-y-4">
        <p class="text-slate-400 text-sm">
          No email recovery is configured. You'll need server access to reset your password.
        </p>
        <button
          onclick={requestRecovery}
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          I have a recovery code
        </button>
        <a href="/login" class="block text-center text-slate-400 hover:text-white">
          Back to Login
        </a>
      </div>
    {:else}
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1">Recovery Code / Current Password</label>
          <input
            type="text"
            bind:value={recoveryCode}
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            placeholder="Enter recovery code or current password"
          />
        </div>

        <div>
          <label class="block text-sm text-slate-400 mb-1">New Password</label>
          <input
            type="password"
            bind:value={newPassword}
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            placeholder="Min 6 characters"
          />
        </div>

        <div>
          <label class="block text-sm text-slate-400 mb-1">Confirm Password</label>
          <input
            type="password"
            bind:value={confirmPassword}
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            placeholder="Confirm new password"
          />
        </div>

        <button
          onclick={resetPassword}
          disabled={loading}
          class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded text-white"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <a href="/login" class="block text-center text-slate-400 hover:text-white">
          Back to Login
        </a>
      </div>
    {/if}

    <div class="mt-6 pt-4 border-t border-slate-700">
      <p class="text-slate-500 text-xs">
        No email configured. SSH to your server and run:<br/>
        <code class="bg-slate-700 px-2 py-1 rounded mt-1 inline-block">ADMIN_PASSWORD=newpass node build</code>
      </p>
    </div>
  </div>
</div>