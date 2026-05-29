<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { tabs } from "./lib/state/tabs.svelte";
  import { prefs } from "./lib/state/prefs.svelte";
  import { openFile, openPath, saveActive, saveActiveAs, closeTabSafely } from "./lib/fs/files";
  import TitleBar from "./lib/components/TitleBar.svelte";
  import TabBar from "./lib/components/TabBar.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import Preview from "./lib/components/Preview.svelte";
  import StatusBar from "./lib/components/StatusBar.svelte";
  import Dialog from "./lib/components/Dialog.svelte";

  let unlistenOpenFile: UnlistenFn | null = null;

  onMount(async () => {
    await prefs.init();
    try {
      const initial = await invoke<string | null>("get_initial_file");
      if (initial) await openPath(initial);
    } catch (e) {
      console.warn("[startup] failed to read initial file arg", e);
    }
    unlistenOpenFile = await listen<string>("open-file", (event) => {
      const path = event.payload;
      if (path) openPath(path);
    });
  });

  onDestroy(() => {
    unlistenOpenFile?.();
    unlistenOpenFile = null;
  });

  function handleKey(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;
    const key = e.key.toLowerCase();
    if (key === "n") {
      e.preventDefault();
      tabs.newUntitled("md");
    } else if (key === "o") {
      e.preventDefault();
      openFile();
    } else if (key === "s" && !e.shiftKey) {
      e.preventDefault();
      saveActive();
    } else if (key === "s" && e.shiftKey) {
      e.preventDefault();
      saveActiveAs();
    } else if (key === "w") {
      e.preventDefault();
      if (tabs.activeId) closeTabSafely(tabs.activeId);
    } else if (key === "tab") {
      e.preventDefault();
      tabs.cycleNext();
    } else if (key === "/") {
      e.preventDefault();
      prefs.cycleViewMode();
    } else if (key === "t") {
      e.preventDefault();
      prefs.toggle();
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="app-shell">
  <TitleBar />
  <TabBar />

  <div class="app-main">
    {#if tabs.list.length > 0}
      {#each tabs.list as t (t.id)}
        {@const isActive = t.id === tabs.activeId}
        {@const showEditor = t.kind !== "md" || prefs.viewMode === "edit" || prefs.viewMode === "split"}
        {@const showPreview = t.kind === "md" && (prefs.viewMode === "preview" || prefs.viewMode === "split")}
        <section class="tab-workspace" class:active={isActive} aria-hidden={!isActive}>
          <div class="app-pane" hidden={!showEditor}>
            <Editor tab={t} active={isActive && showEditor} />
          </div>
          {#if t.kind === "md"}
            <div class="app-pane" hidden={!showPreview}>
              <Preview tab={t} active={isActive && showPreview} />
            </div>
          {/if}
        </section>
      {/each}
    {:else}
      <div class="empty-state">
        <h2>typeshit</h2>
        <p>轻量化的 txt / markdown 编辑器</p>
        <div class="hints">
          <div><span class="kbd">Ctrl</span> + <span class="kbd">N</span> 新建</div>
          <div><span class="kbd">Ctrl</span> + <span class="kbd">O</span> 打开</div>
          <div><span class="kbd">Ctrl</span> + <span class="kbd">/</span> 切换视图</div>
          <div><span class="kbd">Ctrl</span> + <span class="kbd">T</span> 切换主题</div>
        </div>
      </div>
    {/if}
  </div>

  <StatusBar />
</div>

<Dialog />

<style>
  .tab-workspace {
    position: absolute;
    inset: 0;
    min-width: 0;
    min-height: 0;
    display: flex;
    pointer-events: none;
    visibility: hidden;
  }
  .tab-workspace.active {
    pointer-events: auto;
    visibility: visible;
  }
</style>
