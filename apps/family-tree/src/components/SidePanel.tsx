import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import type { Person, FamilyTreeDetail } from '../types';
import { getPersonRelations } from '../hooks/usePersonMutations';
import { useSidePanelDialogs } from '../hooks/useSidePanelDialogs';
import { Button, ConfirmDialog } from '@repo/ui';

type Props = {
  person: Person;
  tree: FamilyTreeDetail;
  onClose: () => void;
};

export default function SidePanel({ person, tree, onClose }: Props) {
  const canEdit = tree.myRole === 'OWNER' || tree.myRole === 'EDITOR';
  const { parents, children, spouse } = getPersonRelations(person, tree);
  const { actions, dialogs } = useSidePanelDialogs({ person, tree, onDeleted: onClose });

  return (
    <>
      <div className="relative z-20 w-80 bg-white border-l border-slate-200 h-full overflow-y-auto p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">인물 정보</h3>
          <Button variant="ghost" onClick={onClose} className="p-1 rounded-lg">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        {/* Profile */}
        <div className="text-center mb-5">
          {person.profileImageUrl ? (
            <img
              src={person.profileImageUrl}
              alt={person.name}
              className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-slate-100 flex items-center justify-center text-2xl text-slate-400">
              {person.name[0]}
            </div>
          )}
          <div className="font-bold text-xl text-slate-800">{person.name}</div>
          {person.gender && (
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                person.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              }`}
            >
              {person.gender === 'MALE' ? '남성' : '여성'}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm mb-5">
          {person.birthDate && (
            <div className="flex justify-between">
              <span className="text-slate-500">생년월일</span>
              <span className="text-slate-700">
                {person.birthDate}
                {person.birthDateType === 'LUNAR' && (
                  <span className="ml-1 text-xs text-slate-400">(음력)</span>
                )}
              </span>
            </div>
          )}
          {person.deathDate && (
            <div className="flex justify-between">
              <span className="text-slate-500">사망일</span>
              <span className="text-slate-700">{person.deathDate}</span>
            </div>
          )}
          {person.memo && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg text-slate-600 text-xs">
              {person.memo}
            </div>
          )}
        </div>

        {/* Relations */}
        <div className="space-y-3 text-sm mb-5">
          {parents.length > 0 && (
            <div>
              <span className="text-slate-500 font-medium">부모: </span>
              <span className="text-slate-700">{parents.map((p) => p.name).join(', ')}</span>
            </div>
          )}
          {spouse && (
            <div>
              <span className="text-slate-500 font-medium">배우자: </span>
              <span className="text-slate-700">{spouse.name}</span>
            </div>
          )}
          {children.length > 0 && (
            <div>
              <span className="text-slate-500 font-medium">자녀: </span>
              <span className="text-slate-700">{children.map((c) => c.name).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={actions.openAddParent}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
            >
              <UserPlusIcon className="w-4 h-4" />
              부모 추가
            </Button>
            {!spouse && (
              <Button
                variant="ghost"
                onClick={actions.openAddSpouse}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
              >
                <HeartIcon className="w-4 h-4" />
                배우자 추가
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={actions.openAddChild}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
            >
              <UserPlusIcon className="w-4 h-4" />
              자녀 추가
            </Button>
            <hr className="my-2" />
            <Button
              variant="ghost"
              onClick={actions.openEdit}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              수정
            </Button>
            <ConfirmDialog
              title="인물 삭제"
              description={`"${person.name}" 인물을 삭제하시겠습니까?`}
              confirmLabel="삭제"
              cancelLabel="취소"
              onConfirm={() => actions.deleteMutation.mutate()}
              trigger={
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 border border-red-200"
                >
                  <TrashIcon className="w-4 h-4" />
                  삭제
                </Button>
              }
            />
          </div>
        )}
      </div>

      {dialogs}
    </>
  );
}
