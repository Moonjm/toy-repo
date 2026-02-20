import { type ReactNode, useState } from 'react';
import { Button, Modal } from '@repo/ui';
import type { Person, FamilyTreeDetail } from '../types';
import { usePersonMutations, getPersonRelations } from './usePersonMutations';
import PersonFormDialog from '../components/PersonFormDialog';

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

type Params = {
  person: Person;
  tree: FamilyTreeDetail;
  onDeleted: () => void;
};

export function useSidePanelDialogs({ person, tree, onDeleted }: Params) {
  const [dialog, setDialog] = useState<DialogMode>(null);
  const closeDialog = () => setDialog(null);

  const { editMutation, deleteMutation, addParentMutation, addSpouseMutation, addChildMutation } =
    usePersonMutations({
      treeId: tree.id,
      person,
      onDeleted,
      onDone: closeDialog,
    });

  const { parentCandidates, spouseCandidates } = getPersonRelations(person, tree);

  const handleSelectExisting = (targetId: number) => {
    if (dialog === 'add-parent-existing') {
      addParentMutation.mutate({ existingId: targetId });
    } else if (dialog === 'add-spouse-existing') {
      addSpouseMutation.mutate({ existingId: targetId });
    }
  };

  const actions = {
    openEdit: () => setDialog('edit'),
    openAddParent: () => setDialog('add-parent-choose'),
    openAddSpouse: () => setDialog('add-spouse-choose'),
    openAddChild: () => setDialog('add-child'),
    deleteMutation,
  };

  const dialogs: ReactNode = (
    <>
      {dialog === 'edit' && (
        <PersonFormDialog
          initial={person}
          onSubmit={(data) => editMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {dialog === 'add-parent-choose' && (
        <ChooseDialog
          title="부모 추가"
          onNew={() => setDialog('add-parent-new')}
          onExisting={() => setDialog('add-parent-existing')}
          onClose={closeDialog}
        />
      )}

      {dialog === 'add-parent-new' && (
        <PersonFormDialog
          title="새 부모 추가"
          onSubmit={(data) => addParentMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {dialog === 'add-spouse-choose' && (
        <ChooseDialog
          title="배우자 추가"
          onNew={() => setDialog('add-spouse-new')}
          onExisting={() => setDialog('add-spouse-existing')}
          onClose={closeDialog}
        />
      )}

      {dialog === 'add-spouse-new' && (
        <PersonFormDialog
          title="새 배우자 추가"
          onSubmit={(data) => addSpouseMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {dialog === 'add-child' && (
        <PersonFormDialog
          title="자녀 추가"
          onSubmit={(data) => addChildMutation.mutate(data)}
          onClose={closeDialog}
        />
      )}

      {(dialog === 'add-parent-existing' || dialog === 'add-spouse-existing') && (
        <Modal open onClose={closeDialog} title="인물 선택" maxWidth="sm">
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {(dialog === 'add-parent-existing' ? parentCandidates : spouseCandidates).map((p) => (
              <Button
                key={p.id}
                variant="ghost"
                onClick={() => handleSelectExisting(p.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700"
              >
                {p.name}
                {p.birthDate && <span className="text-xs text-slate-400 ml-2">{p.birthDate}</span>}
              </Button>
            ))}
            {(dialog === 'add-parent-existing' ? parentCandidates : spouseCandidates).length ===
              0 && (
              <p className="text-sm text-slate-400 text-center py-4">선택 가능한 인물이 없습니다</p>
            )}
          </div>
        </Modal>
      )}
    </>
  );

  return { actions, dialogs };
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
    <Modal open onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-2">
        <Button
          variant="secondary"
          onClick={onExisting}
          className="w-full py-2.5 rounded-lg text-sm"
        >
          기존 인물에서 선택
        </Button>
        <Button variant="accent" onClick={onNew} className="w-full py-2.5 rounded-lg text-sm">
          새로 만들기
        </Button>
      </div>
    </Modal>
  );
}
