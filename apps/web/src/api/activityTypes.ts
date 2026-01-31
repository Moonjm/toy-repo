import { deleteJson, getJson, postJson, putJson } from "./client";

export type ActivityType = {
  id: number;
  emoji: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

export type ActivityTypeRequest = {
  emoji: string;
  name: string;
  isActive: boolean;
};

type ActivityTypeApi = {
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

export function fetchActivityTypes(active?: boolean): Promise<DataResponse<ActivityType[]>> {
  const query = active === undefined ? "" : `?active=${encodeURIComponent(String(active))}`;
  return getJson<DataResponse<ActivityTypeApi[]>>(`/activity-types${query}`).then((res) => ({
    ...res,
    data: (res.data ?? []).map((item) => ({
      id: item.id,
      emoji: item.emoji,
      name: item.name,
      sortOrder: item.sortOrder,
      isActive: item.isActive ?? item.active ?? false
    }))
  }));
}

export function createActivityType(
  payload: ActivityTypeRequest
): Promise<number> {
  return postJson<number>("/activity-types", {
    emoji: payload.emoji,
    name: payload.name,
    active: payload.isActive
  });
}

export function updateActivityType(
  id: number,
  payload: ActivityTypeRequest
): Promise<void> {
  return putJson<void>(`/activity-types/${id}`, {
    emoji: payload.emoji,
    name: payload.name,
    active: payload.isActive
  });
}

export function deleteActivityType(id: number): Promise<void> {
  return deleteJson<void>(`/activity-types/${id}`);
}
