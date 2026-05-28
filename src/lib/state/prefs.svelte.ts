import { LazyStore } from "@tauri-apps/plugin-store";

export type Theme = "light" | "dark";
export type ViewMode = "edit" | "preview" | "split";

export interface AppPrefs {
  theme: Theme;
  viewMode: ViewMode;
  recentFiles: string[];
}

const DEFAULTS: AppPrefs = {
  theme: "dark",
  viewMode: "split",
  recentFiles: [],
};

let store: LazyStore | null = null;

function getStore(): LazyStore {
  if (!store) store = new LazyStore("typeshit-prefs.json");
  return store;
}

class ThemeStore {
  current = $state<Theme>(DEFAULTS.theme);
  viewMode = $state<ViewMode>(DEFAULTS.viewMode);
  recentFiles = $state<string[]>([]);
  ready = $state(false);

  async init() {
    try {
      const s = getStore();
      const t = await s.get<Theme>("theme");
      const v = await s.get<ViewMode>("viewMode");
      const r = await s.get<string[]>("recentFiles");
      if (t === "light" || t === "dark") this.current = t;
      if (v === "edit" || v === "preview" || v === "split") this.viewMode = v;
      if (Array.isArray(r)) this.recentFiles = r;
    } catch (e) {
      console.warn("[prefs] failed to load, using defaults", e);
    }
    this.applyTheme();
    this.ready = true;
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.current);
  }

  async setTheme(t: Theme) {
    this.current = t;
    this.applyTheme();
    try {
      const s = getStore();
      await s.set("theme", t);
      await s.save();
    } catch (e) {
      console.warn("[prefs] save theme failed", e);
    }
  }

  async toggle() {
    await this.setTheme(this.current === "dark" ? "light" : "dark");
  }

  async setViewMode(m: ViewMode) {
    this.viewMode = m;
    try {
      const s = getStore();
      await s.set("viewMode", m);
      await s.save();
    } catch (e) {
      console.warn("[prefs] save viewMode failed", e);
    }
  }

  async cycleViewMode() {
    const order: ViewMode[] = ["edit", "split", "preview"];
    const next = order[(order.indexOf(this.viewMode) + 1) % order.length];
    await this.setViewMode(next);
  }

  async pushRecent(path: string) {
    const next = [path, ...this.recentFiles.filter((p) => p !== path)].slice(0, 10);
    this.recentFiles = next;
    try {
      const s = getStore();
      await s.set("recentFiles", next);
      await s.save();
    } catch (e) {
      console.warn("[prefs] save recents failed", e);
    }
  }
}

export const prefs = new ThemeStore();
