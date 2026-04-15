<script lang="ts">
  import { onMount } from 'svelte';

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let message = $state('');
  let error = $state('');

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = '/login';
      }
    } catch (e) {
      window.location.href = '/login';
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      error = 'All fields are required';
      return;
    }

    if (newPassword !== confirmPassword) {
      error = 'New passwords do not match';
      return;
    }

    if (newPassword.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    loading = true;
    error = '';
    message = '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: currentPassword })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        error = 'Current password is incorrect';
        loading = false;
        return;
      }

      const updateRes = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          userId: data.user?.id || 'admin',
          newPassword: newPassword
        })
      });

      const updateData = await updateRes.json();

      if (updateData.success) {
        message = 'Password changed successfully!';
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
      } else {
        error = updateData.error || 'Failed to change password';
      }
    } catch (e: any) {
      error = e.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    checkAuth();
  });
</script>

<svelte:head>
  <title>Change Password - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-white">Change Password</h1>
    <p class="text-slate-400">Update your admin password</p>
  </div>

  {#if error}
    <div class="p-3 bg-red-900/30 border border-red-700 rounded text-red-400">
      {error}
    </div>
  {/if}

  {#if message}
    <div class="p-3 bg-green-900/30 border border-green-700 rounded text-green-400">
      {message}
    </div>
  {/if}

  <div class="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md">
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-slate-400 mb-1">Current Password</label>
        <input
          type="password"
          bind:value={currentPassword}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          placeholder="Enter current password"
        />
      </div>

      <div>
        <label class="block text-sm text-slate-400 mb-1">New Password</label>
        <input
          type="password"
          bind:value={newPassword}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label class="block text-sm text-slate-400 mb-1">Confirm New Password</label>
        <input
          type="password"
          bind:value={confirmPassword}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          placeholder="Confirm new password"
        />
      </div>

      <button
        onclick={changePassword}
        disabled={loading}
        class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white"
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  </div>

  <div class="bg-slate-800 rounded-lg p-4 border border-slate-700 max-w-md">
    <p class="text-slate-400 text-sm">
      Forgot password? 
      <a href="/forgot-password" class="text-blue-400 hover:underline">Reset here</a>
    </p>
  </div>
</div>