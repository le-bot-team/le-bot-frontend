import type MockAdapter from 'axios-mock-adapter';

import type { MockSetupFn } from 'src/mock/utils';

export const setupFamilyGroupMock: MockSetupFn = (mock: MockAdapter) => {
  // GET /family-groups — list all family groups for the current user
  mock.onGet('/family-groups').reply(200, {
    success: true,
    data: [],
  });

  // POST /family-groups — create a new family group
  mock.onPost('/family-groups').reply(201, {
    success: true,
    data: {
      id: 'fg-mock-new',
      name: '新家庭组',
      childName: '',
      deviceId: '',
      creatorId: 'user-mock-1',
      createdAt: new Date().toISOString(),
      members: [],
    },
  });

  // GET /family-groups/:id — get family group detail
  mock.onGet(/\/family-groups\/[\w-]+$/).reply(200, {
    success: true,
    data: {
      id: 'fg-mock-1',
      name: '小新的家庭组',
      childName: '小新',
      deviceId: 'dev-mock-1',
      creatorId: 'user-mock-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      members: [],
    },
  });

  // PUT /family-groups/:id — update family group
  mock.onPut(/\/family-groups\/[\w-]+$/).reply(200, {
    success: true,
  });

  // DELETE /family-groups/:id — delete family group
  mock.onDelete(/\/family-groups\/[\w-]+$/).reply(200, {
    success: true,
  });

  // POST /family-groups/:id/invite — generate invite code
  mock.onPost(/\/family-groups\/[\w-]+\/invite$/).reply(200, {
    success: true,
    data: {
      code: 'MOCK-INVITE-CODE',
      groupId: 'fg-mock-1',
      groupName: '小新的家庭组',
      inviterNickname: '爸爸',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 5,
      usedCount: 0,
    },
  });

  // POST /family-groups/join — join a family group via invite code
  mock.onPost('/family-groups/join').reply(200, {
    success: true,
    data: {
      groupId: 'fg-mock-1',
      groupName: '小新的家庭组',
    },
  });
};
