<script lang="ts">
  import { tabs } from "../state/tabs.svelte";
  import { closeTabSafely } from "../fs/files";

  function onNew() {
    tabs.newUntitled("md");
  }

  async function onClose(e: MouseEvent, id: string) {
    e.stopPropagation();
    await closeTabSafely(id);
  }

  function onMiddleClick(e: MouseEvent, id: string) {
    if (e.button === 1) {
      e.preventDefault();
      closeTabSafely(id);
    }
  }
</script>

{#if tabs.list.length > 0}
  <div class="tabbar" role="tablist">
    <div class="tabs-scroll">
      {#each tabs.list as tab (tab.id)}
        {@const isActive = tab.id === tabs.activeId}
        {@const dirty = tabs.isDirty(tab)}
        <div
          class="tab"
          class:active={isActive}
          role="tab"
          tabindex="0"
          aria-selected={isActive}
          title={tab.path ?? tab.name}
          onclick={() => tabs.activate(tab.id)}
          onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tabs.activate(tab.id); } }}
          onmousedown={(e) => onMiddleClick(e, tab.id)}
        >
          <span class="tab-icon" aria-hidden="true">
            {#if tab.kind === "md"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {:else}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            {/if}
          </span>
          <span class="tab-name">{tab.name}</span>
          <button
            type="button"
            class="tab-close"
            class:dirty
            tabindex="-1"
            aria-label="关闭"
            onclick={(e) => onClose(e, tab.id)}
          >
            {#if dirty}
              <span class="dot"></span>
            {:else}
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.2"/></svg>
            {/if}
          </button>
        </div>
      {/each}
    </div>
    <button class="tab-new" onclick={onNew} title="新建标签 (Ctrl+N)" aria-label="新建标签">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
{/if}

<style>
  .tabbar {
    height: var(--tabbar-h);
    display: flex;
    align-items: stretch;
    background: var(--bg-sunken);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    overflow: hidden;
  }
  .tabs-scroll {
    flex: 1;
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    min-width: 0;
    scrollbar-width: none;
  }
  .tabs-scroll::-webkit-scrollbar { display: none; }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px 0 12px;
    height: 100%;
    min-width: 90px;
    max-width: 220px;
    color: var(--text-muted);
    border-right: 1px solid var(--border);
    background: var(--tab-inactive-bg);
    font-size: 12.5px;
    transition: background 0.1s, color 0.1s;
    position: relative;
    cursor: pointer;
    user-select: none;
  }
  .tab:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .tab:hover { color: var(--text); background: var(--hover); }
  .tab.active {
    color: var(--text);
    background: var(--tab-active-bg);
  }
  .tab.active::before {
    content: "";
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 2px;
    background: var(--accent);
  }
  .tab-icon {
    display: inline-flex;
    color: var(--text-subtle);
    flex-shrink: 0;
  }
  .tab-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .tab-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
    color: var(--text-subtle);
    flex-shrink: 0;
  }
  .tab-close:hover {
    background: var(--hover);
    color: var(--text);
  }
  .tab:not(:hover) .tab-close.dirty .dot {
    display: block;
  }
  .tab-close .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--text-muted);
  }
  .tab:hover .tab-close.dirty .dot { display: none; }
  .tab:hover .tab-close.dirty::after {
    content: "";
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M1 1l8 8M9 1l-8 8' stroke='currentColor' stroke-width='1.2'/></svg>");
  }

  .tab-new {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    color: var(--text-subtle);
    transition: background 0.1s, color 0.1s;
    flex-shrink: 0;
  }
  .tab-new:hover {
    background: var(--hover);
    color: var(--text);
  }
</style>
