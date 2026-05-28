<script lang="ts">
  import { tabs } from "../state/tabs.svelte";
  import { prefs, type ViewMode } from "../state/prefs.svelte";

  let stats = $derived.by(() => {
    const t = tabs.active;
    if (!t) return { chars: 0, words: 0, lines: 0 };
    const content = t.content;
    const lines = content.length === 0 ? 0 : content.split(/\r\n|\r|\n/).length;
    const chars = content.length;
    const words = (content.match(/[一-龥]|[A-Za-z0-9_]+/g) || []).length;
    return { chars, words, lines };
  });

  function setView(m: ViewMode) {
    prefs.setViewMode(m);
  }
</script>

<div class="statusbar">
  {#if tabs.active}
    {@const t = tabs.active}
    <div class="left">
      <span class="path" title={t.path ?? "(未保存)"}>
        {t.path ?? "(未保存)"}
      </span>
    </div>
    <div class="right">
      <span class="seg">UTF-8</span>
      <span class="seg">{t.kind.toUpperCase()}</span>
      <span class="seg">Ln {t.cursor.line}, Col {t.cursor.col}</span>
      <span class="seg">{stats.words} 字 · {stats.chars} 字符 · {stats.lines} 行</span>
      {#if t.kind === "md"}
        <div class="view-toggle" role="group" aria-label="视图模式">
          <button
            class:active={prefs.viewMode === "edit"}
            onclick={() => setView("edit")}
            title="编辑模式"
            aria-label="编辑"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button
            class:active={prefs.viewMode === "split"}
            onclick={() => setView("split")}
            title="分屏模式 (Ctrl+/)"
            aria-label="分屏"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="1"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </button>
          <button
            class:active={prefs.viewMode === "preview"}
            onclick={() => setView("preview")}
            title="预览模式"
            aria-label="预览"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="left muted">就绪</div>
    <div class="right"></div>
  {/if}
</div>

<style>
  .statusbar {
    height: var(--statusbar-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: var(--bg-elevated);
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 11.5px;
    flex-shrink: 0;
    user-select: none;
    gap: 12px;
  }
  .left {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
  }
  .muted { color: var(--text-subtle); }
  .right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .seg {
    color: var(--text-muted);
  }
  .view-toggle {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
  }
  .view-toggle button {
    padding: 2px 6px;
    color: var(--text-subtle);
    background: transparent;
    transition: background 0.1s, color 0.1s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .view-toggle button + button {
    border-left: 1px solid var(--border);
  }
  .view-toggle button:hover {
    background: var(--hover);
    color: var(--text);
  }
  .view-toggle button.active {
    background: var(--accent);
    color: var(--accent-fg);
  }
</style>
