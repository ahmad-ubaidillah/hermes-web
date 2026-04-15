<script lang="ts">
  import { onMount } from 'svelte';

  interface Widget {
    id: string;
    name: string;
    size: 'small' | 'medium' | 'large';
    visible: boolean;
    position: number;
  }

  let widgets = $state<Widget[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let dragging = $state<string | null>(null);
  let selectedWidget = $state<string | null>(null);
  let loadError = $state('');
  let saveMessage = $state('');

  async function loadWidgets() {
    try {
      const res = await fetch('/api/settings/widgets');
      const data = await res.json();
      widgets = data.map((w: Record<string, unknown>) => ({
        id: w.id as string,
        name: w.name as string,
        size: w.size as Widget['size'],
        visible: w.visible === 1,
        position: w.position as number
      }));
    } catch {
      loadError = 'Failed to load widget configuration';
    } finally {
      loading = false;
    }
  }

  async function saveWidgets() {
    saving = true;
    try {
      await fetch('/api/settings/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets })
      });
      saveMessage = 'Configuration saved';
      setTimeout(() => { saveMessage = ''; }, 3000);
    } catch {
      loadError = 'Failed to save widget configuration';
    } finally {
      saving = false;
    }
  }

  function handleDragStart(id: string) {
    dragging = id;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    if (!dragging || dragging === targetId) return;
    
    const fromIdx = widgets.findIndex(w => w.id === dragging);
    const toIdx = widgets.findIndex(w => w.id === targetId);
    
    if (fromIdx === -1 || toIdx === -1) return;
    
    const [moved] = widgets.splice(fromIdx, 1);
    widgets.splice(toIdx, 0, moved);
    widgets = widgets.map((w, i) => ({ ...w, position: i }));
    
    dragging = null;
  }

  function toggleVisibility(id: string) {
    widgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
  }

  function setSize(id: string, size: Widget['size']) {
    widgets = widgets.map(w => w.id === id ? { ...w, size } : w);
  }

  function resetDefaults() {
    widgets = [
      { id: 'system', name: 'System Info', size: 'medium', visible: true, position: 0 },
      { id: 'memory', name: 'Memory', size: 'medium', visible: true, position: 1 },
      { id: 'disk', name: 'Disk', size: 'medium', visible: true, position: 2 },
      { id: 'network', name: 'Network', size: 'small', visible: true, position: 3 },
      { id: 'docker', name: 'Docker', size: 'small', visible: true, position: 4 },
      { id: 'services', name: 'Services', size: 'medium', visible: true, position: 5 },
    ];
  }

  function getSizeClasses(size: string) {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  }

  onMount(() => {
    loadWidgets();
  });
</script>

<svelte:head>
  <title>Widget Config - Hermes Web UI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-white">Widget Configuration</h1>
    <div class="flex gap-2">
      <button onclick={resetDefaults} class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">
        Reset
      </button>
      <button onclick={saveWidgets} disabled={saving} class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </div>

  {#if loading}
    <div class="text-slate-400">Loading...</div>
  {:else}
    <div class="grid grid-cols-3 gap-4">
      {#each widgets as widget (widget.id)}
        <div
          draggable="true"
          ondragstart={() => handleDragStart(widget.id)}
          ondragover={handleDragOver}
          ondrop={() => handleDrop(widget.id)}
          class="p-4 rounded-lg border-2 transition-all cursor-move {
            dragging === widget.id ? 'border-blue-500 opacity-50' : 
            selectedWidget === widget.id ? 'border-blue-400' : 'border-slate-700 hover:border-slate-600'
          } {widget.visible ? 'bg-slate-800' : 'bg-slate-900 opacity-50'}"
          onclick={() => selectedWidget = selectedWidget === widget.id ? null : widget.id}
          role="button"
          tabindex="0"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-white font-medium">{widget.name}</span>
            <button 
              onclick={(e) => { e.stopPropagation(); toggleVisibility(widget.id); saveWidgets(); }}
              class="px-2 py-1 text-xs rounded {widget.visible ? 'bg-green-600' : 'bg-slate-600'}"
            >
              {widget.visible ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {#if selectedWidget === widget.id}
            <div class="mt-3 pt-3 border-t border-slate-700 space-y-2">
              <p class="text-slate-400 text-sm">Size:</p>
              <div class="flex gap-2">
                <button 
                  onclick={() => { setSize(widget.id, 'small'); saveWidgets(); }}
                  class="px-2 py-1 text-xs rounded {widget.size === 'small' ? 'bg-blue-600' : 'bg-slate-700'}"
                >
                  Small
                </button>
                <button 
                  onclick={() => { setSize(widget.id, 'medium'); saveWidgets(); }}
                  class="px-2 py-1 text-xs rounded {widget.size === 'medium' ? 'bg-blue-600' : 'bg-slate-700'}"
                >
                  Medium
                </button>
                <button 
                  onclick={() => { setSize(widget.id, 'large'); saveWidgets(); }}
                  class="px-2 py-1 text-xs rounded {widget.size === 'large' ? 'bg-blue-600' : 'bg-slate-700'}"
                >
                  Large
                </button>
              </div>
            </div>
          {/if}

          <div class="mt-2 text-xs text-slate-500">
            Position: {widget.position + 1} | Size: {widget.size}
          </div>
        </div>
      {/each}
    </div>

    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h2 class="text-lg font-semibold text-white mb-4">Preview</h2>
      <div class="grid grid-cols-3 gap-4">
        {#each widgets.filter(w => w.visible).sort((a, b) => a.position - b.position) as widget (widget.id)}
          <div class="p-3 bg-slate-700 rounded {getSizeClasses(widget.size)}">
            <p class="text-sm text-slate-300">{widget.name}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>