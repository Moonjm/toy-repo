import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, removeToast } from './toast-store';

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => removeToast(toast.id)}
          className={`px-4 py-3 rounded-xl shadow-lg text-sm text-white text-left cursor-pointer transition-opacity hover:opacity-90 ${
            toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
