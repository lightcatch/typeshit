import type { EditorView } from "@codemirror/view";

class ScrollSync {
  editorView: EditorView | null = null;
  previewEl: HTMLElement | null = null;
  source: "editor" | "preview" | null = null;
  private timer: number | null = null;

  fromEditor(ratio: number) {
    if (this.source === "preview") return;
    this.source = "editor";
    if (this.previewEl) {
      const max = this.previewEl.scrollHeight - this.previewEl.clientHeight;
      if (max > 0) this.previewEl.scrollTop = ratio * max;
    }
    this.armReset();
  }

  fromPreview(ratio: number) {
    if (this.source === "editor") return;
    this.source = "preview";
    if (this.editorView) {
      const dom = this.editorView.scrollDOM;
      const max = dom.scrollHeight - dom.clientHeight;
      if (max > 0) dom.scrollTop = ratio * max;
    }
    this.armReset();
  }

  private armReset() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => (this.source = null), 80);
  }
}

export const scrollSync = new ScrollSync();
