<script lang="ts">
  import { onMount } from 'svelte';

  interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }

  interface HermesStatus {
    installed: boolean;
    version: string;
  }

  let messages: Message[] = $state([
    { role: 'assistant', content: 'Hello! I\'m Hermes. How can I help you today?', timestamp: new Date().toISOString() }
  ]);
  let input = $state('');
  let loading = $state(false);
  let hermesStatus = $state<HermesStatus>({ installed: false, version: '' });

  async function checkHermes() {
    try {
      const res = await fetch('/api/chat');
      hermesStatus = await res.json();
    } catch (e) {
      console.error(e);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    messages = [...messages, userMessage];
    input = '';
    loading = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'No response', 
        timestamp: new Date().toISOString() 
      };
      messages = [...messages, assistantMessage];
    } catch (e: any) {
      const errorMsg: Message = { 
        role: 'assistant', 
        content: e.message || 'Error communicating with Hermes', 
        timestamp: new Date().toISOString() 
      };
      messages = [...messages, errorMsg];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    checkHermes();
  });
</script>

<svelte:head>
  <title>Chat - Hermes Web UI</title>
</svelte:head>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">Chat</h1>
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full {hermesStatus.installed ? 'bg-green-500' : 'bg-red-500'}"></span>
      <span class="text-sm {hermesStatus.installed ? 'text-green-400' : 'text-red-400'}">
        {hermesStatus.installed ? `Hermes ${hermesStatus.version}` : 'Hermes not installed'}
      </span>
    </div>
  </div>

  {#if !hermesStatus.installed}
    <div class="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
      <p class="text-yellow-400">
        Hermes CLI is not installed. 
        <a href="/setup" class="underline">Go to Setup to install Hermes</a>
      </p>
    </div>
  {/if}

  <div class="bg-slate-800 rounded-lg border border-slate-700 h-[500px] flex flex-col">
    <div class="flex-1 p-4 overflow-y-auto space-y-4">
      {#each messages as msg}
        <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[70%] px-4 py-2 rounded-lg {msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}">
            {msg.content}
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="flex justify-start">
          <div class="bg-slate-700 text-slate-400 px-4 py-2 rounded-lg">Thinking...</div>
        </div>
      {/if}
    </div>

    <div class="p-4 border-t border-slate-700">
      <form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          bind:value={input}
          disabled={loading}
          class="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
        />
        <button type="submit" disabled={loading || !input.trim()} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white transition">
          Send
        </button>
      </form>
    </div>
  </div>
</div>