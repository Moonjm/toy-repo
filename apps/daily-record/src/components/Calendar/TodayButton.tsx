import dayjs from 'dayjs';
import { Button } from '@repo/ui';

type TodayButtonProps = {
  visibleMonth: string;
  onGoToday: () => void;
};

export default function TodayButton({ visibleMonth, onGoToday }: TodayButtonProps) {
  if (visibleMonth === dayjs().format('YYYY-MM')) return null;
  return (
    <Button
      variant="secondary"
      size="md"
      type="button"
      onClick={onGoToday}
      radius="full"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 border border-slate-200 bg-white text-slate-700 shadow-md active:bg-slate-50"
    >
      &lsaquo; 오늘
    </Button>
  );
}
