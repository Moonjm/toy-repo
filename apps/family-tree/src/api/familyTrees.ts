import { getApiClient, type DataResponse } from '@repo/api';
import type { FamilyTreeListItem, FamilyTreeDetail, FamilyTreeRequest } from '../types';
import { postForLocationId } from './postForLocationId';

export function fetchFamilyTrees(): Promise<DataResponse<FamilyTreeListItem[]>> {
  return getApiClient().get<DataResponse<FamilyTreeListItem[]>>('/family-trees');
}

export function fetchFamilyTree(id: number): Promise<DataResponse<FamilyTreeDetail>> {
  return getApiClient().get<DataResponse<FamilyTreeDetail>>(`/family-trees/${id}`);
}

export function createFamilyTree(payload: FamilyTreeRequest): Promise<number> {
  return postForLocationId('/family-trees', JSON.stringify(payload), {
    'Content-Type': 'application/json',
  });
}

export function updateFamilyTree(id: number, payload: FamilyTreeRequest): Promise<void> {
  return getApiClient().put<void>(`/family-trees/${id}`, payload);
}

export function deleteFamilyTree(id: number): Promise<void> {
  return getApiClient().delete<void>(`/family-trees/${id}`);
}
