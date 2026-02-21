import { TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '@repo/ui';
import type { DailyRecord } from '../../api/dailyRecords';

type RecordListProps = {
  myRecords: DailyRecord[];
  partnerRecords: DailyRecord[];
  isPaired: boolean;
  partnerName: string;
  onEdit: (record: DailyRecord) => void;
  onDelete: (recordId: number) => void;
  busy: boolean;
};

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
                className={`flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs${isMine ? ' cursor-pointer active:bg-blue-100' : ''}`}
                onClick={isMine ? () => onEdit(record) : undefined}
              >
                <span className="text-sm">{record.category.emoji}</span>
                <span className="text-slate-800">{record.category.name}</span>
                {record.memo && <span className="text-slate-500">{record.memo}</span>}
                <span className="flex-1" />
                {isMine && (
                  <IconButton
                    variant="ghost"
                    size="xs"
                    className="flex-shrink-0 border border-red-200 bg-white text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                    disabled={busy}
                    type="button"
                    aria-label="삭제"
                  >
                    <TrashIcon />
                  </IconButton>
                )}
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
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs active:bg-slate-50"
          onClick={() => onEdit(record)}
        >
          <span className="text-sm">{record.category.emoji}</span>
          <span className="text-slate-800">{record.category.name}</span>
          {record.memo && <span className="text-slate-500">{record.memo}</span>}
          <span className="flex-1" />
          <IconButton
            variant="ghost"
            size="xs"
            className="flex-shrink-0 border border-red-200 bg-white text-red-500"
            onClick={async (e) => {
              e.stopPropagation();
              await onDelete(record.id);
            }}
            disabled={busy}
            type="button"
            aria-label="삭제"
          >
            <TrashIcon />
          </IconButton>
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
              <span className="text-sm">{record.category.emoji}</span>
              <span className="text-slate-800">{record.category.name}</span>
              {record.memo && <span className="text-slate-500">{record.memo}</span>}
            </div>
          ))}
        </>
      )}
    </>
  );
}
