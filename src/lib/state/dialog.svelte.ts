type Choice = "save" | "discard" | "cancel";

class DialogState {
  open = $state(false);
  title = $state("");
  message = $state("");
  resolver: ((c: Choice) => void) | null = null;

  ask(title: string, message: string): Promise<Choice> {
    if (this.open && this.resolver) {
      this.resolver("cancel");
    }
    this.title = title;
    this.message = message;
    this.open = true;
    return new Promise((resolve) => {
      this.resolver = resolve;
    });
  }

  pick(c: Choice) {
    if (!this.open) return;
    this.open = false;
    const r = this.resolver;
    this.resolver = null;
    r?.(c);
  }
}

export const dialog = new DialogState();
export type { Choice };
