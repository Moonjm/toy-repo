import { getApiClient, type DataResponse } from '@repo/api';
import type { FamilyTreeListItem, FamilyTreeDetail, FamilyTreeRequest } from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

export function fetchFamilyTrees(): Promise<DataResponse<FamilyTreeListItem[]>> {
  return getApiClient().get<DataResponse<FamilyTreeListItem[]>>('/family-trees');
}

export function fetchFamilyTree(id: number): Promise<DataResponse<FamilyTreeDetail>> {
  return getApiClient().get<DataResponse<FamilyTreeDetail>>(`/family-trees/${id}`);
}

export async function createFamilyTree(payload: FamilyTreeRequest): Promise<number> {
  const response = await fetch(`${BASE_URL}/family-trees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Create failed: ${response.status}`);
  }

  const location = response.headers.get('Location') ?? '';
  const match = location.match(/\/family-trees\/(\d+)/);
  if (!match) {
    throw new Error('Tree ID not found in Location header');
  }

  return Number(match[1]);
}

export function updateFamilyTree(id: number, payload: FamilyTreeRequest): Promise<void> {
  return getApiClient().put<void>(`/family-trees/${id}`, payload);
}

export function deleteFamilyTree(id: number): Promise<void> {
  return getApiClient().delete<void>(`/family-trees/${id}`);
}
