import { useState } from 'react';
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import type { Person, FamilyTreeDetail } from '../types';
import { usePersonMutations, getPersonRelations } from '../hooks/usePersonMutations';
import { Button, ConfirmDialog } from '@repo/ui';
import PersonFormDialog from './PersonFormDialog';

type Props = {
  person: Person;
  tree: FamilyTreeDetail;
  onClose: () => void;
};

type DialogMode =
  | null
  | 'edit'
  | 'add-parent-choose'
  | 'add-parent-new'
  | 'add-parent-existing'
  | 'add-spouse-choose'
  | 'add-spouse-new'
  | 'add-spouse-existing'
  | 'add-child';

export default function SidePanel({ person, tree, onClose }: Props) {
  const [dialog, setDialog] = useState<DialogMode>(null);
  const closeDialog = () => setDialog(null);

  const { editMutation, deleteMutation, addParentMutation, addSpouseMutation, addChildMutation } =
    usePersonMutations({
      treeId: tree.id,
      person,
      tree,
      onDeleted: onClose,
      onDone: closeDialog,
    });

  const { parents, children, spouse, existingCandidates } = getPersonRelations(person, tree);

  const handleSelectExisting = (targetId: number) => {
    if (dialog === 'add-parent-existing') {
      addParentMutation.mutate({ existingId: targetId });
    } else if (dialog === 'add-spouse-existing') {
      addSpouseMutation.mutate({ existingId: targetId });
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-l border-slate-200 h-full overflow-y-auto p-5 shadow-lg">
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
              <span className="text-slate-700">{person.birthDate}</span>
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
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => setDialog('add-parent-choose')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
          >
            <UserPlusIcon className="w-4 h-4" />
            부모 추가
          </Button>
          {!spouse && (
            <Button
              variant="ghost"
              onClick={() => setDialog('add-spouse-choose')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
            >
              <HeartIcon className="w-4 h-4" />
              배우자 추가
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setDialog('add-child')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 border border-slate-200"
          >
            <UserPlusIcon className="w-4 h-4" />
            자녀 추가
          </Button>
          <hr className="my-2" />
          <Button
            variant="ghost"
            onClick={() => setDialog('edit')}
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
            onConfirm={() => deleteMutation.mutate()}
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
      </div>

      {/* Edit Dialog */}
      {dialog === 'edit' && (
        <PersonFormDialog
          initial={person}
          onSubmit={(data) => editMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {/* Add Parent - Choose */}
      {dialog === 'add-parent-choose' && (
        <ChooseDialog
          title="부모 추가"
          onNew={() => setDialog('add-parent-new')}
          onExisting={() => setDialog('add-parent-existing')}
          onClose={closeDialog}
        />
      )}

      {/* Add Parent - New */}
      {dialog === 'add-parent-new' && (
        <PersonFormDialog
          title="새 부모 추가"
          onSubmit={(data) => addParentMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {/* Add Spouse - Choose */}
      {dialog === 'add-spouse-choose' && (
        <ChooseDialog
          title="배우자 추가"
          onNew={() => setDialog('add-spouse-new')}
          onExisting={() => setDialog('add-spouse-existing')}
          onClose={closeDialog}
        />
      )}

      {/* Add Spouse - New */}
      {dialog === 'add-spouse-new' && (
        <PersonFormDialog
          title="새 배우자 추가"
          onSubmit={(data) => addSpouseMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {/* Add Child */}
      {dialog === 'add-child' && (
        <PersonFormDialog
          title="자녀 추가"
          onSubmit={(data) => addChildMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {/* Select Existing Person */}
      {(dialog === 'add-parent-existing' || dialog === 'add-spouse-existing') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">인물 선택</h3>
              <Button variant="ghost" onClick={closeDialog} className="p-1 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {existingCandidates.map((p) => (
                <Button
                  key={p.id}
                  variant="ghost"
                  onClick={() => handleSelectExisting(p.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700"
                >
                  {p.name}
                  {p.birthDate && (
                    <span className="text-xs text-slate-400 ml-2">{p.birthDate}</span>
                  )}
                </Button>
              ))}
              {existingCandidates.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  선택 가능한 인물이 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChooseDialog({
  title,
  onNew,
  onExisting,
  onClose,
}: {
  title: string;
  onNew: () => void;
  onExisting: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <Button variant="ghost" onClick={onClose} className="p-1 rounded-lg">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
        <div className="space-y-2">
          <Button
            variant="secondary"
            onClick={onExisting}
            className="w-full py-2.5 rounded-lg text-sm"
          >
            기존 인물에서 선택
          </Button>
          <Button
            variant="primary"
            onClick={onNew}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm"
          >
            새로 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
