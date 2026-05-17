import { defineBoot } from '#q-app/wrappers';

export default defineBoot(async () => {
  const mockEnabled = process.env.VITE_MOCK_ENABLED === 'true';
  const wsMockEnabled = process.env.VITE_MOCK_WS_ENABLED === 'true';

  if (!mockEnabled && !wsMockEnabled) return;

  const mock = await import('src/mock');

  if (mockEnabled) {
    mock.setupMock();
  }

  if (wsMockEnabled) {
    mock.setupWsMock();
  }
});
