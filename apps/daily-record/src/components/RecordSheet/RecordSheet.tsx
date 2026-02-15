import React from 'react';

type RecordSheetProps = {
  open: boolean;
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  sheetScrollRef: React.RefObject<HTMLDivElement | null>;
};

export default function RecordSheet({
  open,
  onClose,
  header,
  children,
  sheetScrollRef,
}: RecordSheetProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md transform flex-col rounded-t-2xl bg-white shadow-lg transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70dvh' }}
      >
        <div
          className="flex-shrink-0 px-5 pt-5 cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => {
            e.stopPropagation();
            const startY = e.touches[0]?.clientY ?? 0;
            const onMove = (ev: TouchEvent) => {
              ev.preventDefault();
              ev.stopPropagation();
              const dy = (ev.touches[0]?.clientY ?? 0) - startY;
              if (dy > 60) {
                onClose();
                document.removeEventListener('touchmove', onMove, true);
                document.removeEventListener('touchend', onEnd, true);
              }
            };
            const onEnd = (ev: TouchEvent) => {
              ev.stopPropagation();
              document.removeEventListener('touchmove', onMove, true);
              document.removeEventListener('touchend', onEnd, true);
            };
            document.addEventListener('touchmove', onMove, { capture: true, passive: false });
            document.addEventListener('touchend', onEnd, true);
          }}
          onClick={onClose}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
          {header}
        </div>
        <div ref={sheetScrollRef} className="grid gap-3 overflow-y-auto px-5 pb-5">
          {children}
        </div>
      </div>
    </>
  );
}
