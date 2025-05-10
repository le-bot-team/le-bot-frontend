export enum WsAction {}

export interface WsResponse {
  action: WsAction;
  data: unknown;
}

export type WsHandler<T extends WsResponse> = (message: T) => Promise<void>;
