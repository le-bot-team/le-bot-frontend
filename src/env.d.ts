declare namespace NodeJS {
  // noinspection JSUnusedGlobalSymbols
  interface ProcessEnv {
    LE_BOT_BACKEND_HTTP_BASE_URL: string;
    LE_BOT_BACKEND_WS_BASE_URL: string;
    NODE_ENV: string;
    VITE_MOCK_ENABLED: string;
    VITE_MOCK_WS_ENABLED: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
