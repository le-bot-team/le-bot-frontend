/**
 * Avatar upload API 调用层
 *
 * POST /api/v1/upload/avatar
 * Content-Type: multipart/form-data
 * Body: file (image/png|jpeg, max 2MB)
 *
 * Response: { success: true, data: { url: string, avatarId: string } }
 */

import { api } from 'boot/axios';

export interface UploadAvatarResponse {
  success: boolean;
  data?: {
    url: string;
    avatarId: string;
  };
  message?: string;
}

/** 上传头像图片到服务器，返回 CDN URL */
export const uploadAvatar = async (file: File, accessToken: string) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.post<UploadAvatarResponse>('/upload/avatar', formData, {
    headers: {
      'x-access-token': accessToken,
      'Content-Type': 'multipart/form-data',
    },
  });
};
