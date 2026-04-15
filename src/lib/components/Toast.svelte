<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }

  let toasts = $state<Toast[]>([]);
  let toastId = 0;

  function showToast(message: string, type: Toast['type'] = 'info') {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4000);
  }

  function dismissToast(id: number) {
    toasts = toasts.filter(t => t.id !== id);
  }

  declare global {
    interface Window {
      showToast: typeof showToast;
    }
  }
  window.showToast = showToast;
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each toasts as toast (toast.id)}
    <div 
      class="p-4 rounded-lg shadow-lg max-w-sm animate-slide-in {
        toast.type === 'success' ? 'bg-green-600' :
        toast.type === 'error' ? 'bg-red-600' :
        toast.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
      }"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-white text-sm">{toast.message}</span>
        <button onclick={() => dismissToast(toast.id)} class="text-white/70 hover:text-white">✕</button>
      </div>
    </div>
  {/each}
</div>

<slot />

<style>
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
</style>