import { useRef } from 'react';
import { Button, Input } from '@repo/ui';
import type { Category } from '../../api/categories';
import CategoryIcon from '../CategoryIcon';

type RecordFormProps = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  memoInput: string;
  onMemoChange: (value: string) => void;
  togetherInput: boolean;
  onToggleTogether: () => void;
  editingRecordId: number | null;
  onSave: () => void;
  onCancelEdit: () => void;
  busy: boolean;
};

export default function RecordForm({
  categories,
  selectedCategoryId,
  onSelectCategory,
  memoInput,
  onMemoChange,
  togetherInput,
  onToggleTogether,
  editingRecordId,
  onSave,
  onCancelEdit,
  busy,
}: RecordFormProps) {
  const memoRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {editingRecordId && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          기록 수정
        </p>
      )}
      <div className="grid gap-3">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500">
            선택할 카테고리가 없습니다.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <Button
                  key={category.id}
                  variant="none"
                  size="md"
                  radius="full"
                  className={`border ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                  onClick={() => onSelectCategory(category.id)}
                  type="button"
                >
                  <CategoryIcon emoji={category.emoji} className="mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            ref={memoRef}
            value={memoInput}
            maxLength={20}
            onChange={(event) => onMemoChange(event.target.value)}
            onFocus={() => {
              setTimeout(() => {
                memoRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }, 300);
            }}
            placeholder="메모 (최대 20자)"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
          />
          <Button
            variant="none"
            size="sm"
            type="button"
            radius="full"
            className={`flex-shrink-0 border ${
              togetherInput
                ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
            onClick={onToggleTogether}
          >
            👫 같이
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={onSave}
            disabled={busy}
            type="button"
          >
            {busy ? '저장 중...' : '저장'}
          </Button>
          {editingRecordId && (
            <Button
              variant="secondary"
              size="md"
              className="border border-slate-200 text-slate-600"
              onClick={onCancelEdit}
              type="button"
            >
              취소
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
