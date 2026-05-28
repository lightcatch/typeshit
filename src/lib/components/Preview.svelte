<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { renderMarkdown } from "../markdown/renderer";
  import { scrollSync } from "../state/scroll";
  import type { Tab } from "../state/tabs.svelte";

  interface Props {
    tab: Tab;
  }
  let { tab }: Props = $props();

  let scrollEl: HTMLDivElement;

  let html = $derived(renderMarkdown(tab.content));

  onMount(() => {
    scrollSync.previewEl = scrollEl;
  });

  onDestroy(() => {
    if (scrollSync.previewEl === scrollEl) scrollSync.previewEl = null;
  });

  function handleScroll() {
    if (!scrollEl) return;
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    const ratio = max > 0 ? scrollEl.scrollTop / max : 0;
    scrollSync.fromPreview(ratio);
  }
</script>

<div bind:this={scrollEl} class="preview-host" onscroll={handleScroll}>
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
