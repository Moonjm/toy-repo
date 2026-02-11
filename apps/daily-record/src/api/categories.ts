import { deleteJson, getJson, postJson, putJson } from './client';

export type Category = {
  id: number;
  emoji: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

export type CategoryRequest = {
  emoji: string;
  name: string;
  isActive: boolean;
};

type CategoryApi = {
  id: number;
  emoji: string;
  name: string;
  sortOrder: number;
  isActive?: boolean;
  active?: boolean;
};

export type DataResponse<T> = {
  data: T;
  status: number;
  message?: string | null;
  timestamp: string;
};

export function fetchCategories(active?: boolean): Promise<DataResponse<Category[]>> {
  const query = active === undefined ? '' : `?active=${encodeURIComponent(String(active))}`;
  return getJson<DataResponse<CategoryApi[]>>(`/categories${query}`).then((res) => ({
    ...res,
    data: (res.data ?? []).map((item) => ({
      id: item.id,
      emoji: item.emoji,
      name: item.name,
      sortOrder: item.sortOrder,
      isActive: item.isActive ?? item.active ?? false,
    })),
  }));
}

export function createCategory(payload: CategoryRequest): Promise<number> {
  return postJson<number>('/categories', {
    emoji: payload.emoji,
    name: payload.name,
    isActive: payload.isActive,
  });
}

export function updateCategory(id: number, payload: CategoryRequest): Promise<void> {
  return putJson<void>(`/categories/${id}`, {
    emoji: payload.emoji,
    name: payload.name,
    isActive: payload.isActive,
  });
}

export function deleteCategory(id: number): Promise<void> {
  return deleteJson<void>(`/categories/${id}`);
}

export function reorderCategory(targetId: number, beforeId: number | null): Promise<void> {
  return putJson<void>('/categories/order', { targetId, beforeId });
}
