import { Button } from '@repo/ui';
import type { OvereatLevel } from '../../api/dailyRecords';

type OvereatSelectorProps = {
  currentLevel: OvereatLevel;
  onSelect: (level: OvereatLevel) => void;
  disabled: boolean;
};

const LEVELS: { level: OvereatLevel; label: string; style: string }[] = [
  { level: 'NONE', label: '없음', style: 'border-slate-200 bg-white text-slate-500' },
  { level: 'MILD', label: '소', style: 'border-green-300 bg-green-100 text-green-700' },
  { level: 'MODERATE', label: '중', style: 'border-orange-300 bg-orange-200 text-orange-700' },
  { level: 'SEVERE', label: '대', style: 'border-red-300 bg-red-200 text-red-700' },
  { level: 'EXTREME', label: '대대', style: 'border-purple-400 bg-purple-200 text-purple-800' },
];

export default function OvereatSelector({
  currentLevel,
  onSelect,
  disabled,
}: OvereatSelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">🐷 과식</span>
      <div className="ml-auto flex gap-1">
        {LEVELS.map(({ level, label, style }) => {
          const isActive = currentLevel === level;
          return (
            <Button
              key={level}
              variant="secondary"
              size="xs"
              type="button"
              style={{ '--btn-radius': 'var(--radius-full)' } as React.CSSProperties}
              className={
                isActive
                  ? style + ' ring-1 ring-offset-1'
                  : 'border-slate-200 bg-white text-slate-400'
              }
              onClick={() => onSelect(level)}
              disabled={disabled}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
