import type { KeyboardEvent } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { IconButton, ConfirmDialog } from '@repo/ui';
import type { DailyRecord } from '../../api/dailyRecords';
import CategoryIcon from '../CategoryIcon';

type RecordListProps = {
  myRecords: DailyRecord[];
  partnerRecords: DailyRecord[];
  isPaired: boolean;
  partnerName: string;
  onEdit: (record: DailyRecord) => void;
  onDelete: (recordId: number) => void;
  busy: boolean;
};

function handleActivate(callback: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

function RecordContent({ record }: { record: DailyRecord }) {
  return (
    <>
      <CategoryIcon emoji={record.category.emoji} className="text-sm" />
      <span className="text-slate-800">{record.category.name}</span>
      {record.memo && <span className="text-slate-500">{record.memo}</span>}
    </>
  );
}

function DeleteButton({
  record,
  onDelete,
  busy,
}: {
  record: DailyRecord;
  onDelete: (recordId: number) => void;
  busy: boolean;
}) {
  return (
    <ConfirmDialog
      title="기록 삭제"
      description={`"${record.category.name}" 기록을 삭제하시겠어요?`}
      confirmLabel="삭제"
      cancelLabel="취소"
      onConfirm={() => onDelete(record.id)}
      trigger={
        <IconButton
          variant="none"
          size="xs"
          className="flex-shrink-0 border border-red-200 bg-white text-red-500"
          onClick={(e) => e.stopPropagation()}
          disabled={busy}
          type="button"
          aria-label="삭제"
        >
          <TrashIcon />
        </IconButton>
      }
    />
  );
}

export default function RecordList({
  myRecords,
  partnerRecords,
  isPaired,
  partnerName,
  onEdit,
  onDelete,
  busy,
}: RecordListProps) {
  const myTogether = myRecords.filter((r) => r.together);
  const myNormal = myRecords.filter((r) => !r.together);
  const partnerTogether = partnerRecords.filter((r) => r.together);
  const partnerNormal = partnerRecords.filter((r) => !r.together);
  const togetherAll = [...myTogether, ...partnerTogether];

  return (
    <>
      {togetherAll.length > 0 && (
        <>
          <p className="text-xs font-semibold text-blue-500">👫 같이 한 것</p>
          {togetherAll.map((record) => {
            const isMine = myTogether.some((r) => r.id === record.id);
            return (
              <div
                key={`t-${record.id}`}
                role={isMine ? 'button' : undefined}
                tabIndex={isMine ? 0 : undefined}
                className={`flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs${isMine ? ' cursor-pointer active:bg-blue-100' : ''}`}
                onClick={isMine ? () => onEdit(record) : undefined}
                onKeyDown={isMine ? handleActivate(() => onEdit(record)) : undefined}
              >
                <RecordContent record={record} />
                <span className="flex-1" />
                {isMine && <DeleteButton record={record} onDelete={onDelete} busy={busy} />}
              </div>
            );
          })}
        </>
      )}
      {isPaired && myNormal.length > 0 && (
        <p className="text-xs font-semibold text-slate-400">나의 기록</p>
      )}
      {myNormal.map((record) => (
        <div
          key={record.id}
          role="button"
          tabIndex={0}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs active:bg-slate-50"
          onClick={() => onEdit(record)}
          onKeyDown={handleActivate(() => onEdit(record))}
        >
          <RecordContent record={record} />
          <span className="flex-1" />
          <DeleteButton record={record} onDelete={onDelete} busy={busy} />
        </div>
      ))}
      {isPaired && partnerNormal.length > 0 && (
        <>
          <p className="mt-2 text-xs font-semibold text-slate-400">{partnerName}의 기록</p>
          {partnerNormal.map((record) => (
            <div
              key={`p-${record.id}`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs"
            >
              <RecordContent record={record} />
            </div>
          ))}
        </>
      )}
    </>
  );
}
