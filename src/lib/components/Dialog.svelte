<script lang="ts">
  import { dialog } from "../state/dialog.svelte";

  function onKey(e: KeyboardEvent) {
    if (!dialog.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      dialog.pick("cancel");
    } else if (e.key === "Enter") {
      e.preventDefault();
      dialog.pick("save");
    }
  }
</script>

<svelte:window onkeydown={onKey} />

{#if dialog.open}
  <div
    class="overlay"
    role="presentation"
    onclick={() => dialog.pick("cancel")}
  >
    <div
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <h3 id="dialog-title" class="title">{dialog.title}</h3>
      <p class="message">{dialog.message}</p>
      <div class="actions">
        <button class="btn" onclick={() => dialog.pick("cancel")}>取消</button>
        <button class="btn" onclick={() => dialog.pick("discard")}>不保存</button>
        <button class="btn primary" onclick={() => dialog.pick("save")}>
          保存
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }
  .dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    min-width: 380px;
    max-width: 560px;
    padding: 20px 22px 16px;
    color: var(--text);
  }
  .title {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 600;
  }
  .message {
    margin: 0 0 18px;
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.6;
    white-space: pre-wrap;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .btn {
    padding: 6px 14px;
    font-size: 13px;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    background: transparent;
    transition: background 0.1s, border-color 0.1s;
  }
  .btn:hover {
    background: var(--hover);
    border-color: var(--border-strong);
  }
  .btn.primary {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: var(--accent);
  }
  .btn.primary:hover {
    background: var(--accent);
    filter: brightness(1.1);
  }
</style>
