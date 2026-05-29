<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { renderMarkdown } from "../markdown/renderer";
  import { scrollSync } from "../state/scroll";
  import { tabs, type Tab } from "../state/tabs.svelte";

  interface Props {
    tab: Tab;
    active: boolean;
  }
  let { tab, active }: Props = $props();

  let scrollEl: HTMLDivElement;
  let registeredActive = false;

  let html = $derived(renderMarkdown(tab.content));

  function readRatio(): number {
    if (!scrollEl) return 0;
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, scrollEl.scrollTop / max));
  }

  function rememberScroll() {
    tabs.setPreviewRatio(tab.id, readRatio());
  }

  function becomeActive() {
    scrollSync.previewEl = scrollEl;
    scrollSync.resetSource();
    registeredActive = true;
  }

  function becomeInactive() {
    rememberScroll();
    registeredActive = false;
    if (scrollSync.previewEl === scrollEl) scrollSync.previewEl = null;
  }

  function setActiveState(next: boolean) {
    if (registeredActive === next) return;
    if (next) becomeActive();
    else becomeInactive();
  }

  onMount(() => {
    setActiveState(active);
  });

  onDestroy(() => {
    if (registeredActive) becomeInactive();
  });

  $effect(() => {
    setActiveState(active);
  });

  function handleScroll() {
    if (!scrollEl || !registeredActive) return;
    const ratio = readRatio();
    tabs.setPreviewRatio(tab.id, ratio);
    scrollSync.fromPreview(ratio);
  }
</script>

<div bind:this={scrollEl} class="preview-host" onscroll={handleScroll} aria-hidden={!active}>
  <article class="markdown-body">
    {@html html}
  </article>
</div>

<style>
  .preview-host {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background: var(--bg);
  }
</style>
