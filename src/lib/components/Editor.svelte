<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import { tabs, type Tab } from "../state/tabs.svelte";
  import { prefs } from "../state/prefs.svelte";
  import { scrollSync } from "../state/scroll";
  import {
    makeEditor,
    setEditorTheme,
    setEditorDoc,
    setEditorMarkdown,
  } from "../editor/setup";
  import type { EditorView } from "@codemirror/view";

  interface Props {
    tab: Tab;
    active: boolean;
  }
  let { tab, active }: Props = $props();

  let host: HTMLDivElement;
  let view: EditorView | null = null;
  let lastDocPushed = "";
  let registeredActive = false;

  function cursorOffset(text: string, cursor: { line: number; col: number }) {
    const targetLine = Math.max(1, Math.floor(cursor.line || 1));
    const targetCol = Math.max(1, Math.floor(cursor.col || 1));
    let line = 1;
    let lineStart = 0;
    let i = 0;

    while (i < text.length && line < targetLine) {
      const ch = text.charCodeAt(i);
      if (ch === 13 || ch === 10) {
        if (ch === 13 && text.charCodeAt(i + 1) === 10) i++;
        line++;
        lineStart = i + 1;
      }
      i++;
    }

    if (line < targetLine) return text.length;

    let lineEnd = lineStart;
    while (lineEnd < text.length) {
      const ch = text.charCodeAt(lineEnd);
      if (ch === 13 || ch === 10) break;
      lineEnd++;
    }

    return Math.min(lineStart + targetCol - 1, lineEnd);
  }

  function readRatio(): number {
    if (!view) return 0;
    const el = view.scrollDOM;
    const max = el.scrollHeight - el.clientHeight;
    return max > 0 ? el.scrollTop / max : 0;
  }

  function rememberScroll() {
    if (!view) return;
    tabs.setEditorScrollTop(tab.id, view.scrollDOM.scrollTop);
    if (!scrollSync.previewEl) tabs.setPreviewRatio(tab.id, readRatio());
  }

  function becomeActive() {
    if (!view) return;
    registeredActive = true;
    scrollSync.editorView = view;
    scrollSync.resetSource();
    view.requestMeasure();
  }

  function becomeInactive() {
    if (!view) return;
    rememberScroll();
    registeredActive = false;
    if (scrollSync.editorView === view) scrollSync.editorView = null;
  }

  function setActiveState(next: boolean) {
    if (!view || registeredActive === next) return;
    if (next) becomeActive();
    else becomeInactive();
  }

  onMount(() => {
    view = makeEditor({
      parent: host,
      initialDoc: tab.content,
      isMarkdown: tab.kind === "md",
      isDark: prefs.current === "dark",
      onChange: (doc) => {
        lastDocPushed = doc;
        tabs.setContent(tab.id, doc);
      },
      onCursor: (line, col) => {
        tabs.setCursor(tab.id, line, col);
      },
      onScroll: (top, ratio) => {
        if (!registeredActive) return;
        tabs.setEditorScrollTop(tab.id, top);
        tabs.setPreviewRatio(tab.id, ratio);
        scrollSync.fromEditor(ratio);
      },
    });
    lastDocPushed = tab.content;
    view.dispatch({
      selection: { anchor: cursorOffset(tab.content, tab.cursor) },
      scrollIntoView: false,
    });
    setActiveState(active);
  });

  onDestroy(() => {
    if (view && registeredActive) becomeInactive();
    view?.destroy();
    view = null;
  });

  $effect(() => {
    if (!view) return;
    const content = tab.content;
    untrack(() => {
      if (content !== lastDocPushed) {
        setEditorDoc(view!, content);
        lastDocPushed = content;
      }
    });
  });

  $effect(() => {
    if (!view) return;
    const isMd = tab.kind === "md";
    untrack(() => setEditorMarkdown(view!, isMd));
  });

  $effect(() => {
    if (!view) return;
    const isDark = prefs.current === "dark";
    untrack(() => setEditorTheme(view!, isDark));
  });

  $effect(() => {
    const next = active;
    untrack(() => setActiveState(next));
  });
</script>

<div bind:this={host} class="editor-host" data-kind={tab.kind} aria-hidden={!active}></div>

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
