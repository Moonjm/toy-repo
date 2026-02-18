import { getApiClient, type DataResponse } from '@repo/api';
import type { Member, MemberRequest, MemberRoleRequest } from '../types';

export function fetchMembers(treeId: number): Promise<DataResponse<Member[]>> {
  return getApiClient().get<DataResponse<Member[]>>(`/family-trees/${treeId}/members`);
}

export function addMember(treeId: number, payload: MemberRequest): Promise<void> {
  return getApiClient().post<void>(`/family-trees/${treeId}/members`, payload);
}

export function updateMemberRole(
  treeId: number,
  memberId: number,
  payload: MemberRoleRequest
): Promise<void> {
  return getApiClient().put<void>(`/family-trees/${treeId}/members/${memberId}`, payload);
}

export function removeMember(treeId: number, memberId: number): Promise<void> {
  return getApiClient().delete<void>(`/family-trees/${treeId}/members/${memberId}`);
}
