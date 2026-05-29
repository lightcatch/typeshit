import { EditorState, Compartment, Transaction, type StateEffect } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { searchKeymap, search, highlightSelectionMatches } from "@codemirror/search";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { tags as t } from "@lezer/highlight";

export const themeCompartment = new Compartment();
export const langCompartment = new Compartment();
export const highlightCompartment = new Compartment();

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
    backgroundColor: "var(--bg)",
    color: "var(--text)",
  },
  ".cm-scroller": {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", "JetBrains Mono", Consolas, monospace',
    lineHeight: "1.7",
  },
  ".cm-content": {
    padding: "20px 28px",
    caretColor: "var(--accent)",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--text-subtle)",
    border: "none",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--text)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--hover)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--accent)",
    borderLeftWidth: "2px",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--selection)",
  },
  ".cm-searchMatch": {
    backgroundColor: "rgba(255, 200, 0, 0.25)",
    outline: "1px solid rgba(255, 200, 0, 0.5)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(255, 150, 0, 0.5)",
  },
  ".cm-panels": {
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text)",
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "1px solid var(--border)",
  },
  ".cm-panel input": {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  ".cm-panel button": {
    backgroundColor: "transparent",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "2px 8px",
    margin: "0 2px",
    cursor: "pointer",
  },
});

function makeHighlight(isDark: boolean): HighlightStyle {
  return HighlightStyle.define([
    { tag: t.heading, color: isDark ? "#82aaff" : "#0550ae", fontWeight: "600" },
    { tag: t.heading1, fontSize: "1.4em" },
    { tag: t.heading2, fontSize: "1.25em" },
    { tag: t.heading3, fontSize: "1.1em" },
    { tag: t.strong, fontWeight: "700", color: isDark ? "#d6deeb" : "#1f2328" },
    { tag: t.emphasis, fontStyle: "italic", color: isDark ? "#d6deeb" : "#1f2328" },
    { tag: t.strikethrough, textDecoration: "line-through", color: isDark ? "#5a6477" : "#8b949e" },
    { tag: t.link, color: isDark ? "#7fdbca" : "#0a3069", textDecoration: "underline" },
    { tag: t.url, color: isDark ? "#7fdbca" : "#0a3069" },
    { tag: t.monospace, color: isDark ? "#ecc48d" : "#953800", backgroundColor: isDark ? "rgba(236, 196, 141, 0.08)" : "rgba(149, 56, 0, 0.06)" },
    { tag: t.quote, color: isDark ? "#8b95a5" : "#656d76", fontStyle: "italic" },
    { tag: t.list, color: isDark ? "#c792ea" : "#8250df" },
    { tag: t.meta, color: isDark ? "#5a6477" : "#8b949e" },
    { tag: [t.processingInstruction, t.string, t.inserted], color: isDark ? "#ecc48d" : "#0a3069" },
    { tag: t.comment, color: isDark ? "#5a6477" : "#6a737d", fontStyle: "italic" },
  ]);
}

export function makeEditor(opts: {
  parent: HTMLElement;
  initialDoc: string;
  isMarkdown: boolean;
  isDark: boolean;
  onChange: (doc: string) => void;
  onCursor: (line: number, col: number) => void;
  onScroll: (scrollTop: number, ratio: number) => void;
}): EditorView {
  const updateListener = EditorView.updateListener.of((u) => {
    if (u.docChanged) opts.onChange(u.state.doc.toString());
    if (u.selectionSet || u.docChanged) {
      const head = u.state.selection.main.head;
      const line = u.state.doc.lineAt(head);
      opts.onCursor(line.number, head - line.from + 1);
    }
  });

  const scrollListener = EditorView.domEventHandlers({
    scroll(_ev, view) {
      const el = view.scrollDOM;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? el.scrollTop / max : 0;
      opts.onScroll(el.scrollTop, ratio);
    },
  });

  const state = EditorState.create({
    doc: opts.initialDoc,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      search({ top: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
      EditorView.lineWrapping,
      langCompartment.of(opts.isMarkdown ? markdown({ base: markdownLanguage }) : []),
      highlightCompartment.of(syntaxHighlighting(makeHighlight(opts.isDark))),
      themeCompartment.of(baseTheme),
      updateListener,
      scrollListener,
    ],
  });

  return new EditorView({
    state,
    parent: opts.parent,
  });
}

export function setEditorMarkdown(view: EditorView, isMarkdown: boolean) {
  view.dispatch({
    effects: langCompartment.reconfigure(isMarkdown ? markdown({ base: markdownLanguage }) : []),
  });
}

export function setEditorTheme(view: EditorView, isDark: boolean) {
  view.dispatch({
    effects: highlightCompartment.reconfigure(syntaxHighlighting(makeHighlight(isDark))),
  });
}

export function setEditorDoc(view: EditorView, doc: string) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: doc },
  });
}

export function switchEditorTab(
  view: EditorView,
  doc: string,
  isMarkdown: boolean,
  selectionAnchor = 0,
) {
  const anchor = Math.max(0, Math.min(selectionAnchor, doc.length));
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: doc },
    selection: { anchor },
    effects: [langCompartment.reconfigure(isMarkdown ? markdown({ base: markdownLanguage }) : [])],
    scrollIntoView: false,
    annotations: Transaction.addToHistory.of(false),
  });
}
