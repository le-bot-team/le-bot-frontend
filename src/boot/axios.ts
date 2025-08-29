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

// noinspection JSUnusedGlobalSymbols
export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
