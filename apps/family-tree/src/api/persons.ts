import { getApiClient } from '@repo/api';
import type { PersonRequest } from '../types';

export function createPerson(treeId: number, payload: PersonRequest): Promise<number> {
  return getApiClient().post<number>(`/family-trees/${treeId}/persons`, payload);
}

export function updatePerson(
  treeId: number,
  personId: number,
  payload: PersonRequest
): Promise<void> {
  return getApiClient().put<void>(`/family-trees/${treeId}/persons/${personId}`, payload);
}

export function deletePerson(treeId: number, personId: number): Promise<void> {
  return getApiClient().delete<void>(`/family-trees/${treeId}/persons/${personId}`);
}
