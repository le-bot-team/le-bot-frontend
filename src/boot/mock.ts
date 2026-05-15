import { defineBoot } from '#q-app/wrappers';

export default defineBoot(async () => {
  if (process.env.VITE_MOCK_ENABLED === 'true') {
    const { setupMock } = await import('src/mock');
    setupMock();
  }

  if (process.env.VITE_MOCK_WS_ENABLED === 'true') {
    const { setupWsMock } = await import('src/mock');
    setupWsMock();
  }
});
