import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { tabs, type Tab } from "../state/tabs.svelte";
import { prefs } from "../state/prefs.svelte";
import { dialog } from "../state/dialog.svelte";

const FILE_FILTERS = [
  { name: "Text", extensions: ["txt", "md", "markdown"] },
  { name: "Markdown", extensions: ["md", "markdown"] },
  { name: "Plain Text", extensions: ["txt"] },
  { name: "All", extensions: ["*"] },
];

export async function openFile(): Promise<void> {
  const selected = await openDialog({
    multiple: false,
    directory: false,
    filters: FILE_FILTERS,
  });
  if (!selected || typeof selected !== "string") return;
  await openPath(selected);
}

export async function openPath(path: string): Promise<void> {
  try {
    const content = await readTextFile(path);
    tabs.openLoaded(path, content);
    await prefs.pushRecent(path);
  } catch (e) {
    console.error("[fs] open failed", e);
    alert(`无法打开文件：\n${e}`);
  }
}

export async function saveActive(): Promise<boolean> {
  const t = tabs.active;
  if (!t) return false;
  if (!t.path) return saveActiveAs();
  return saveTab(t, t.path);
}

export async function saveActiveAs(): Promise<boolean> {
  const t = tabs.active;
  if (!t) return false;
  const defaultName = t.name;
  const path = await saveDialog({
    defaultPath: t.path ?? defaultName,
    filters: FILE_FILTERS,
  });
  if (!path) return false;
  return saveTab(t, path);
}

async function saveTab(tab: Tab, path: string): Promise<boolean> {
  try {
    await writeTextFile(path, tab.content);
    tabs.markSaved(tab.id, path);
    await prefs.pushRecent(path);
    return true;
  } catch (e) {
    console.error("[fs] save failed", e);
    alert(`保存失败：\n${e}`);
    return false;
  }
}

export async function confirmCloseDirty(tab: Tab): Promise<"save" | "discard" | "cancel"> {
  return dialog.ask("未保存的更改", `「${tab.name}」尚未保存，是否保存改动？`);
}

export async function closeTabSafely(id: string): Promise<boolean> {
  const tab = tabs.list.find((t) => t.id === id);
  if (!tab) return true;
  if (!tabs.isDirty(tab)) {
    tabs.close(id);
    return true;
  }
  tabs.activate(id);
  const action = await confirmCloseDirty(tab);
  if (action === "cancel") return false;
  if (action === "save") {
    const ok = tab.path ? await saveTab(tab, tab.path) : await saveActiveAs();
    if (!ok) return false;
  }
  tabs.close(id);
  return true;
}

export async function confirmCloseWindow(): Promise<boolean> {
  const dirty = tabs.list.filter((t) => tabs.isDirty(t));
  if (dirty.length === 0) return true;

  const names = dirty.map((t) => `  • ${t.name}`).join("\n");
  const message =
    dirty.length === 1
      ? `「${dirty[0].name}」尚未保存，是否保存改动？`
      : `${dirty.length} 个文件尚未保存：\n${names}\n\n是否保存全部改动？`;

  const action = await dialog.ask("未保存的更改", message);
  if (action === "cancel") return false;
  if (action === "discard") return true;

  for (const t of dirty) {
    tabs.activate(t.id);
    const ok = t.path ? await saveTab(t, t.path) : await saveActiveAs();
    if (!ok) return false;
  }
  return true;
}
