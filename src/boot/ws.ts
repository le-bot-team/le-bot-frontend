import { defineBoot } from '#q-app/wrappers';
import { WsWrapper } from 'src/types/websocket';

const ws = new WsWrapper('wss://ws.coze.cn/v1/chat');

export default defineBoot(({ app }) => {
  app.config.globalProperties.$ws = ws;
});

export { ws };
