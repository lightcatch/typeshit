<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import { tabs, type Tab } from "../state/tabs.svelte";
  import { prefs } from "../state/prefs.svelte";
  import { scrollSync } from "../state/scroll";
  import {
    makeEditor,
    setEditorMarkdown,
    setEditorTheme,
    setEditorDoc,
  } from "../editor/setup";
  import type { EditorView } from "@codemirror/view";

  interface Props {
    tab: Tab;
  }
  let { tab }: Props = $props();

  let host: HTMLDivElement;
  let view: EditorView | null = null;
  let mountedTabId: string | null = null;
  let lastDocPushed = "";

  onMount(() => {
    view = makeEditor({
      parent: host,
      initialDoc: tab.content,
      isMarkdown: tab.kind === "md",
      isDark: prefs.current === "dark",
      onChange: (doc) => {
        if (!mountedTabId) return;
        lastDocPushed = doc;
        tabs.setContent(mountedTabId, doc);
      },
      onCursor: (line, col) => {
        if (mountedTabId) tabs.setCursor(mountedTabId, line, col);
      },
      onScroll: (ratio) => {
        if (mountedTabId) tabs.setScroll(mountedTabId, ratio);
        scrollSync.fromEditor(ratio);
      },
    });
    mountedTabId = tab.id;
    lastDocPushed = tab.content;
    scrollSync.editorView = view;
  });

  onDestroy(() => {
    if (scrollSync.editorView === view) scrollSync.editorView = null;
    view?.destroy();
    view = null;
  });

  $effect(() => {
    if (!view) return;
    const id = tab.id;
    const isMd = tab.kind === "md";
    const content = tab.content;
    untrack(() => {
      if (id !== mountedTabId) {
        mountedTabId = id;
        setEditorDoc(view!, content);
        lastDocPushed = content;
        setEditorMarkdown(view!, isMd);
      } else if (content !== lastDocPushed) {
        setEditorDoc(view!, content);
        lastDocPushed = content;
      }
    });
  });

  $effect(() => {
    if (!view) return;
    const isDark = prefs.current === "dark";
    untrack(() => setEditorTheme(view!, isDark));
  });
</script>

<div bind:this={host} class="editor-host" data-kind={tab.kind}></div>

<style>
  .editor-host {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--bg);
  }
  .editor-host :global(.cm-editor) {
    height: 100%;
  }
  .editor-host :global(.cm-editor.cm-focused) {
    outline: none;
  }
</style>
