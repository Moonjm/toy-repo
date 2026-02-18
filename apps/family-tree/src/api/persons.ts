import { getApiClient } from '@repo/api';
import type { PersonRequest } from '../types';
import { postForLocationId } from './postForLocationId';

export function createPerson(treeId: number, payload: PersonRequest): Promise<number> {
  return postForLocationId(`/family-trees/${treeId}/persons`, JSON.stringify(payload), {
    'Content-Type': 'application/json',
  });
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
