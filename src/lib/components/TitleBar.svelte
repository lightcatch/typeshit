<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { prefs } from "../state/prefs.svelte";
  import { tabs } from "../state/tabs.svelte";
  import { openFile, saveActive, confirmCloseWindow } from "../fs/files";

  let isMaximized = $state(false);

  async function refreshMax() {
    try {
      isMaximized = await getCurrentWindow().isMaximized();
    } catch {
      /* ignore */
    }
  }

  refreshMax();

  function onMin() {
    getCurrentWindow().minimize();
  }
  function onMax() {
    getCurrentWindow().toggleMaximize().then(refreshMax);
  }
  function onClose() {
    (async () => {
      const ok = await confirmCloseWindow();
      if (!ok) return;
      await getCurrentWindow().destroy();
    })();
  }

  let titleText = $derived.by(() => {
    const t = tabs.active;
    if (!t) return "typeshit";
    const dirty = tabs.isDirty(t) ? " •" : "";
    return `${t.name}${dirty} — typeshit`;
  });

  $effect(() => {
    document.title = titleText;
  });
</script>

<div class="titlebar">
  <div class="titlebar-left" data-tauri-drag-region>
    <span class="logo" data-tauri-drag-region>typeshit</span>
  </div>

  <div class="titlebar-actions">
    <button class="action" title="打开 (Ctrl+O)" onclick={openFile} aria-label="打开">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>
    </button>
    <button class="action" title="保存 (Ctrl+S)" onclick={() => saveActive()} aria-label="保存" disabled={!tabs.active}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    </button>
    <button class="action" title="切换主题 (Ctrl+T)" onclick={() => prefs.toggle()} aria-label="切换主题">
      {#if prefs.current === "dark"}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      {/if}
    </button>
  </div>

  <div class="window-controls">
    <button class="wc" onclick={onMin} aria-label="最小化" title="最小化">
      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" stroke-width="1"/></svg>
    </button>
    <button class="wc" onclick={onMax} aria-label="最大化" title={isMaximized ? "还原" : "最大化"}>
      {#if isMaximized}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><rect x="1.5" y="2.5" width="6" height="6"/><path d="M3 2.5V1h6v6H7.5"/></svg>
      {:else}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="1" width="8" height="8"/></svg>
      {/if}
    </button>
    <button class="wc wc-close" onclick={onClose} aria-label="关闭" title="关闭">
      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1"/></svg>
    </button>
  </div>
</div>

<style>
  .titlebar {
    height: var(--titlebar-h);
    display: flex;
    align-items: center;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    user-select: none;
    flex-shrink: 0;
  }
  .titlebar-left {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 14px;
    height: 100%;
    min-width: 0;
  }
  .logo {
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }
  .titlebar-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 8px;
    height: 100%;
  }
  .action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 26px;
    border-radius: 4px;
    color: var(--text-muted);
    transition: background 0.12s, color 0.12s;
  }
  .action:hover:not(:disabled) {
    background: var(--hover);
    color: var(--text);
  }
  .action:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .window-controls {
    display: flex;
    height: 100%;
  }
  .wc {
    width: 44px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: background 0.12s, color 0.12s;
  }
  .wc:hover {
    background: var(--hover);
    color: var(--text);
  }
  .wc-close:hover {
    background: var(--danger);
    color: #fff;
  }
</style>
