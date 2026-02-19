import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Person, PersonRequest, FamilyTreeDetail } from '../types';
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

export function getPersonRelations(person: Person, tree: FamilyTreeDetail) {
  const parents = tree.parentChild
    .filter((pc) => pc.childId === person.id)
    .map((pc) => tree.persons.find((p) => p.id === pc.parentId))
    .filter((p): p is Person => Boolean(p));

  const children = tree.parentChild
    .filter((pc) => pc.parentId === person.id)
    .map((pc) => tree.persons.find((p) => p.id === pc.childId))
    .filter((p): p is Person => Boolean(p));

  const spouseRel = tree.spouses.find(
    (s) => s.personAId === person.id || s.personBId === person.id
  );
  const spouse = spouseRel
    ? (tree.persons.find(
        (p) =>
          p.id === (spouseRel.personAId === person.id ? spouseRel.personBId : spouseRel.personAId)
      ) ?? null)
    : null;

  // 모든 자손 ID 수집 (순환 관계 방지)
  const descendantIds = new Set<number>();
  const collectDescendants = (id: number) => {
    for (const pc of tree.parentChild) {
      if (pc.parentId === id && !descendantIds.has(pc.childId)) {
        descendantIds.add(pc.childId);
        collectDescendants(pc.childId);
      }
    }
  };
  collectDescendants(person.id);

  // 모든 조상 ID 수집
  const ancestorIds = new Set<number>();
  const collectAncestors = (id: number) => {
    for (const pc of tree.parentChild) {
      if (pc.childId === id && !ancestorIds.has(pc.parentId)) {
        ancestorIds.add(pc.parentId);
        collectAncestors(pc.parentId);
      }
    }
  };
  collectAncestors(person.id);

  // 부모 후보: 자기 자신, 이미 부모인 사람, 모든 자손 제외
  const parentExcludeIds = new Set([person.id, ...parents.map((p) => p.id), ...descendantIds]);
  const parentCandidates = tree.persons.filter((p) => !parentExcludeIds.has(p.id));

  // 배우자 후보: 자기 자신, 모든 조상/자손, 이미 배우자가 있는 사람 제외
  const peopleWithSpouse = new Set(tree.spouses.flatMap((s) => [s.personAId, s.personBId]));
  const spouseExcludeIds = new Set([
    person.id,
    ...ancestorIds,
    ...descendantIds,
    ...peopleWithSpouse,
  ]);
  const spouseCandidates = tree.persons.filter((p) => !spouseExcludeIds.has(p.id));

  return { parents, children, spouse, parentCandidates, spouseCandidates };
}
