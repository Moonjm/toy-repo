import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Person, PersonRequest } from '../types';
import { createPerson, updatePerson, deletePerson } from '../api/persons';
import { addSpouse, addParentChild } from '../api/relationships';
import { queryKeys } from '../queryKeys';

type UsePersonMutationsParams = {
  treeId: number;
  person: Person;
  onDeleted: () => void;
  onDone: () => void;
};

export function usePersonMutations({
  treeId,
  person,
  onDeleted,
  onDone,
}: UsePersonMutationsParams) {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.tree(treeId) });

  const editMutation = useMutation({
    mutationFn: (data: PersonRequest) => updatePerson(treeId, person.id, data),
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePerson(treeId, person.id),
    onSuccess: () => {
      invalidate();
      onDeleted();
    },
  });

  const addParentMutation = useMutation({
    mutationFn: async (data: PersonRequest | { existingId: number }) => {
      const parentId = 'existingId' in data ? data.existingId : await createPerson(treeId, data);
      await addParentChild(treeId, parentId, person.id);
    },
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });

  const addSpouseMutation = useMutation({
    mutationFn: async (data: PersonRequest | { existingId: number }) => {
      const spouseId = 'existingId' in data ? data.existingId : await createPerson(treeId, data);
      await addSpouse(treeId, person.id, spouseId);
    },
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });

  const addChildMutation = useMutation({
    mutationFn: async (data: PersonRequest) => {
      const childId = await createPerson(treeId, data);
      await addParentChild(treeId, person.id, childId);
    },
    onSuccess: () => {
      invalidate();
      onDone();
    },
  });

  return { editMutation, deleteMutation, addParentMutation, addSpouseMutation, addChildMutation };
}
