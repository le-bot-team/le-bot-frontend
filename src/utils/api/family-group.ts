/**
 * Family Group API 调用层
 *
 * 所有家庭组相关的后端接口调用。
 */

import { api } from 'boot/axios';

import type {
  AcceptInviteRequest,
  AcceptInviteResponse,
  FetchGroupDetailResponse,
  FetchMyFamilyGroupsResponse,
  GenerateInviteCodeResponse,
  LeaveGroupResponse,
  RemoveMemberResponse,
  ResolveInviteCodeResponse,
  UpdateChildInfoRequest,
  UpdateChildInfoResponse,
} from 'src/types/api/family-group';

/** 获取我的家庭组列表 */
export const fetchMyFamilyGroups = async (accessToken: string) =>
  await api.get<FetchMyFamilyGroupsResponse>('/family-groups/mine', {
    headers: { 'x-access-token': accessToken },
  });

/** 获取家庭组详情（含成员列表） */
export const fetchGroupDetail = async (groupId: string, accessToken: string) =>
  await api.get<FetchGroupDetailResponse>(`/family-groups/${groupId}`, {
    headers: { 'x-access-token': accessToken },
  });

/** 生成邀请码 + 二维码 */
export const generateInviteCode = async (groupId: string, accessToken: string) =>
  await api.post<GenerateInviteCodeResponse>(
    `/family-groups/${groupId}/invite`,
    {},
    { headers: { 'x-access-token': accessToken } },
  );

/** 接受邀请加入家庭组 */
export const acceptInvite = async (accessToken: string, data: AcceptInviteRequest) =>
  await api.post<AcceptInviteResponse>('/family-groups/join', data, {
    headers: { 'x-access-token': accessToken },
  });

/** 解析邀请码信息（扫码后预览） */
export const resolveInviteCode = async (code: string, accessToken?: string) => {
  if (accessToken) {
    return await api.get<ResolveInviteCodeResponse>(`/family-groups/invite/${code}`, {
      headers: { 'x-access-token': accessToken },
    });
  }
  return await api.get<ResolveInviteCodeResponse>(`/family-groups/invite/${code}`);
};

/** 移除成员 (Creator 操作) */
export const removeMember = async (groupId: string, memberId: string, accessToken: string) =>
  await api.delete<RemoveMemberResponse>(`/family-groups/${groupId}/members/${memberId}`, {
    headers: { 'x-access-token': accessToken },
  });

/** 主动退出家庭组 (Invitee 操作) */
export const leaveGroup = async (groupId: string, accessToken: string) =>
  await api.post<LeaveGroupResponse>(
    `/family-groups/${groupId}/leave`,
    {},
    { headers: { 'x-access-token': accessToken } },
  );

/** 更新儿童信息 */
export const updateChildInfoApi = async (
  groupId: string,
  data: UpdateChildInfoRequest,
  accessToken: string,
) =>
  await api.put<UpdateChildInfoResponse>(`/family-groups/${groupId}/child`, data, {
    headers: { 'x-access-token': accessToken },
  });
