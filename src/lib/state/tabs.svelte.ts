export type FileKind = "txt" | "md";

export interface Tab {
  id: string;
  path: string | null;
  name: string;
  kind: FileKind;
  content: string;
  savedContent: string;
  cursor: { line: number; col: number };
  scrollRatio: number;
}

let nextId = 0;
const newId = () => `t${++nextId}-${Date.now().toString(36)}`;

export function detectKind(name: string): FileKind {
  const lower = name.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "md";
  return "txt";
}

export function basename(p: string): string {
  const m = p.split(/[\\/]/);
  return m[m.length - 1] || p;
}

class TabsStore {
  list = $state<Tab[]>([]);
  activeId = $state<string | null>(null);

  active = $derived(this.list.find((t) => t.id === this.activeId) ?? null);

  isDirty(t: Tab): boolean {
    return t.content !== t.savedContent;
  }

  hasAnyDirty(): boolean {
    return this.list.some((t) => this.isDirty(t));
  }

  newUntitled(kind: FileKind = "md"): Tab {
    const tab: Tab = {
      id: newId(),
      path: null,
      name: kind === "md" ? "Untitled.md" : "Untitled.txt",
      kind,
      content: "",
      savedContent: "",
      cursor: { line: 1, col: 1 },
      scrollRatio: 0,
    };
    this.list.push(tab);
    this.activeId = tab.id;
    return tab;
  }

  openLoaded(path: string, content: string): Tab {
    const existing = this.list.find((t) => t.path === path);
    if (existing) {
      this.activeId = existing.id;
      return existing;
    }
    const name = basename(path);
    const tab: Tab = {
      id: newId(),
      path,
      name,
      kind: detectKind(name),
      content,
      savedContent: content,
      cursor: { line: 1, col: 1 },
      scrollRatio: 0,
    };
    this.list.push(tab);
    this.activeId = tab.id;
    return tab;
  }

  setContent(id: string, content: string) {
    const tab = this.list.find((t) => t.id === id);
    if (tab) tab.content = content;
  }

  markSaved(id: string, path: string) {
    const tab = this.list.find((t) => t.id === id);
    if (!tab) return;
    tab.path = path;
    tab.name = basename(path);
    tab.kind = detectKind(tab.name);
    tab.savedContent = tab.content;
  }

  setCursor(id: string, line: number, col: number) {
    const tab = this.list.find((t) => t.id === id);
    if (tab) tab.cursor = { line, col };
  }

  setScroll(id: string, ratio: number) {
    const tab = this.list.find((t) => t.id === id);
    if (tab) tab.scrollRatio = ratio;
  }

  activate(id: string) {
    if (this.list.some((t) => t.id === id)) this.activeId = id;
  }

  close(id: string) {
    const idx = this.list.findIndex((t) => t.id === id);
    if (idx === -1) return;
    this.list.splice(idx, 1);
    if (this.activeId === id) {
      const next = this.list[idx] ?? this.list[idx - 1] ?? null;
      this.activeId = next ? next.id : null;
    }
  }

  cycleNext() {
    if (this.list.length < 2 || !this.activeId) return;
    const idx = this.list.findIndex((t) => t.id === this.activeId);
    const next = this.list[(idx + 1) % this.list.length];
    this.activeId = next.id;
  }
}

export const tabs = new TabsStore();
