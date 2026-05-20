import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  // noinspection JSUnusedGlobalSymbols
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: `${process.env.LE_BOT_BACKEND_HTTP_BASE_URL}/api/v1` });

// Response interceptor: handle token expiry signalled via business-level errors
api.interceptors.response.use(
  (response) => {
    // Check for token expiry in business-level error responses
    if (
      response.data?.success === false &&
      typeof response.data?.message === 'string' &&
      (response.data.message === 'Invalid or expired access token' ||
        response.data.message === 'Token is invalid or expired')
    ) {
      // Token expired/invalid — clear auth state
      void import('stores/auth').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        authStore.accessToken = '';
      });
    }
    return response;
  },
  (error: unknown) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

// noinspection JSUnusedGlobalSymbols
export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
