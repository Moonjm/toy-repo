import { getApiClient } from '@repo/api';

export function addSpouse(treeId: number, personId: number, spouseId: number): Promise<void> {
  return getApiClient().post<void>(`/family-trees/${treeId}/relationships/spouse`, {
    personId,
    spouseId,
  });
}

export function removeSpouse(treeId: number, personId: number, spouseId: number): Promise<void> {
  return getApiClient().delete<void>(`/family-trees/${treeId}/relationships/spouse`, {
    params: { personId, spouseId },
  });
}

export function addParentChild(treeId: number, parentId: number, childId: number): Promise<void> {
  return getApiClient().post<void>(`/family-trees/${treeId}/relationships/parent`, {
    parentId,
    childId,
  });
}

export function removeParentChild(
  treeId: number,
  parentId: number,
  childId: number
): Promise<void> {
  return getApiClient().delete<void>(`/family-trees/${treeId}/relationships/parent`, {
    params: { parentId, childId },
  });
}
