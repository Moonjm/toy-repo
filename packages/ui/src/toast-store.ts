export type ToastType = 'error' | 'success';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

let nextId = 0;
let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function addToast(message: string, type: ToastType = 'error') {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => removeToast(id), 4_000);
}

export function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return toasts;
}
