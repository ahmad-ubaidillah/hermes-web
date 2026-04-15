<script lang="ts">
  import { onMount } from 'svelte';
  import { Marked } from 'marked';
  import hljs from 'highlight.js';
  import DOMPurify from 'dompurify';

  interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    tokens?: number;
  }

  interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
  }

  let messages: Message[] = $state([
    { id: '1', role: 'assistant', content: 'Hello! I\'m Hermes. How can I help you today?', timestamp: new Date().toISOString(), tokens: 0 }
  ]);
  let input = $state('');
  let loading = $state(false);
  let hermesStatus = $state<{ installed: boolean; version: string }>({ installed: false, version: '' });
  let sidebarOpen = $state(true);
  let conversations = $state<Conversation[]>([]);
  let activeConversationId = $state<string | null>(null);
  let totalTokens = $state(0);
  let totalCost = $state(0);

  const marked = new Marked();

  function highlightCode(code: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }

  function renderMarkdown(content: string): string {
    try {
      const raw = marked.parse(content) as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return DOMPurify.sanitize(content);
    }
  }

  async function checkHermes() {
    try {
      const res = await fetch('/api/chat');
      hermesStatus = await res.json();
    } catch (e) {
      console.error(e);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/chat/history?limit=50');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const grouped = groupMessagesByConnection(data);
        conversations = grouped;
      }
    } catch {}
  }

  function groupMessagesByConnection(msgs: any[]): Conversation[] {
    const convs: Conversation[] = [];
    let current: Conversation | null = null;
    
    for (const msg of msgs) {
      if (!current || msg.role === 'user') {
        current = {
          id: msg.id || crypto.randomUUID(),
          title: msg.content.slice(0, 40) + (msg.content.length > 40 ? '...' : ''),
          messages: [],
          createdAt: msg.created_at || msg.timestamp || new Date().toISOString()
        };
        convs.push(current);
      }
      current.messages.push(msg);
    }
    return convs;
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString(),
      tokens: input.split(/\s+/).length
    };
    messages = [...messages, userMessage];
    const inputCopy = input;
    input = '';
    loading = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputCopy })
      });
      const data = await res.json();
      
      const tokenEstimate = data.response ? data.response.split(/\s+/).length : 0;
      totalTokens += userMessage.tokens! + tokenEstimate;
      totalCost = Number((totalTokens * 0.00003).toFixed(4));
      
      const assistantMessage: Message = { 
        id: crypto.randomUUID(),
        role: 'assistant', 
        content: data.response || 'No response', 
        timestamp: new Date().toISOString(),
        tokens: tokenEstimate
      };
      messages = [...messages, assistantMessage];

      await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: inputCopy })
      });
      await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: data.response || 'No response' })
      });
    } catch (e: any) {
      const errorMsg: Message = { 
        id: crypto.randomUUID(),
        role: 'assistant', 
        content: e.message || 'Error communicating with Hermes', 
        timestamp: new Date().toISOString(),
        tokens: 0
      };
      messages = [...messages, errorMsg];
    } finally {
      loading = false;
    }
  }

  function exportChat() {
    const content = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hermes-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportChatJSON() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hermes-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function newChat() {
    messages = [{ id: '1', role: 'assistant', content: 'Hello! I\'m Hermes. How can I help you today?', timestamp: new Date().toISOString(), tokens: 0 }];
    totalTokens = 0;
    totalCost = 0;
  }

  onMount(() => {
    checkHermes();
    loadHistory();
  });
</script>

<svelte:head>
  <title>Chat - Hermes Web UI</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</svelte:head>

<div class="flex h-[calc(100vh-0px)]">
  {#if sidebarOpen}
    <div class="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div class="p-3 border-b border-slate-700">
        <button onclick={newChat} class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition">
          + New Chat
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div class="text-xs text-slate-500 px-2 py-1">Current Session</div>
        <button class="w-full text-left px-3 py-2 rounded bg-slate-700 text-white text-sm truncate">
          Current Chat
        </button>
        {#each conversations as conv}
          <button class="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-400 text-sm truncate">
            {conv.title}
          </button>
        {/each}
      </div>
      <div class="p-3 border-t border-slate-700 text-xs text-slate-500">
        Tokens: {totalTokens} | Est. Cost: ${totalCost}
      </div>
    </div>
  {/if}

  <div class="flex-1 flex flex-col">
    <div class="flex items-center justify-between p-3 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <button onclick={() => sidebarOpen = !sidebarOpen} class="p-1 rounded hover:bg-slate-700 text-slate-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <h1 class="text-lg font-bold text-white">Chat</h1>
        <span class="w-2 h-2 rounded-full {hermesStatus.installed ? 'bg-green-500' : 'bg-red-500'}"></span>
        <span class="text-sm {hermesStatus.installed ? 'text-green-400' : 'text-red-400'}">
          {hermesStatus.installed ? `Hermes ${hermesStatus.version}` : 'Hermes not installed'}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick={exportChat} class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300">Export MD</button>
        <button onclick={exportChatJSON} class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300">Export JSON</button>
      </div>
    </div>

    {#if !hermesStatus.installed}
      <div class="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 m-3">
        <p class="text-yellow-400 text-sm">
          Hermes CLI is not installed. <a href="/setup" class="underline">Go to Setup to install Hermes</a>
        </p>
      </div>
    {/if}

    <div class="flex-1 p-4 overflow-y-auto space-y-4">
      {#each messages as msg}
        <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[75%] px-4 py-2 rounded-lg {msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}">
            {#if msg.role === 'assistant'}
              {@html renderMarkdown(msg.content)}
            {:else}
              {msg.content}
            {/if}
            {#if msg.tokens}
              <div class="text-xs mt-1 {msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}">
                {msg.tokens} tokens
              </div>
            {/if}
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