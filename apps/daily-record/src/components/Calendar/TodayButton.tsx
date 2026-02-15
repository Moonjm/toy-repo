import dayjs from 'dayjs';

type TodayButtonProps = {
  visibleMonth: string;
  onGoToday: () => void;
};

export default function TodayButton({ visibleMonth, onGoToday }: TodayButtonProps) {
  if (visibleMonth === dayjs().format('YYYY-MM')) return null;
  return (
    <button
      type="button"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-md active:bg-slate-50"
      onClick={onGoToday}
    >
      &lsaquo; 오늘
    </button>
  );
}
