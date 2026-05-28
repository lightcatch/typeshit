<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { listen } from "@tauri-apps/api/event";
  import { tabs } from "./lib/state/tabs.svelte";
  import { prefs } from "./lib/state/prefs.svelte";
  import { openFile, openPath, saveActive, saveActiveAs, closeTabSafely } from "./lib/fs/files";
  import TitleBar from "./lib/components/TitleBar.svelte";
  import TabBar from "./lib/components/TabBar.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import Preview from "./lib/components/Preview.svelte";
  import StatusBar from "./lib/components/StatusBar.svelte";
  import Dialog from "./lib/components/Dialog.svelte";

  onMount(async () => {
    await prefs.init();
    try {
      const initial = await invoke<string | null>("get_initial_file");
      if (initial) await openPath(initial);
    } catch (e) {
      console.warn("[startup] failed to read initial file arg", e);
    }
    await listen<string>("open-file", (event) => {
      const path = event.payload;
      if (path) openPath(path);
    });
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

  let showEditor = $derived.by(() => {
    const t = tabs.active;
    if (!t) return false;
    if (t.kind !== "md") return true;
    return prefs.viewMode === "edit" || prefs.viewMode === "split";
  });

  let showPreview = $derived.by(() => {
    const t = tabs.active;
    if (!t || t.kind !== "md") return false;
    return prefs.viewMode === "preview" || prefs.viewMode === "split";
  });
</script>

<svelte:window onkeydown={handleKey} />

<div class="app-shell">
  <TitleBar />
  <TabBar />

  <div class="app-main">
    {#if tabs.active}
      {@const t = tabs.active}
      {#if showEditor}
        <div class="app-pane">
          <Editor tab={t} />
        </div>
      {/if}
      {#if showPreview}
        <div class="app-pane">
          <Preview tab={t} />
        </div>
      {/if}
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
