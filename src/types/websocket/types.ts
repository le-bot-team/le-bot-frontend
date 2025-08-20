import { uid } from 'quasar';

export enum WsAction {
  cancelOutput = 'cancelOutput',
  chatComplete = 'chatComplete',
  clearContext = 'clearContext',
  inputAudioComplete = 'inputAudioComplete',
  inputAudioStream = 'inputAudioStream',
  outputAudioComplete = 'outputAudioComplete',
  outputAudioStream = 'outputAudioStream',
  outputTextComplete = 'outputTextComplete',
  outputTextStream = 'outputTextStream',
  updateConfig = 'updateConfig',
}

interface WsBaseResponseError {
  id: string;
  action: WsAction;
  success: false;
  message: string;
}

interface WsBaseResponseSuccess {
  id: string;
  action: WsAction;
  success: true;
}

abstract class WsBaseRequest {
  public readonly id = uid();

  protected constructor(private readonly action: WsAction) {}

  serialize() {
    return {};
  }

  toJSON() {
    return {
      id: this.id,
      action: this.action,
      ...this.serialize(),
    };
  }
}

export interface WsCancelOutputResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.cancelOutput;
  data: {
    cancelType: 'manual' | 'voice';
  };
}

export interface WsChatCompleteResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.chatComplete;
  data: {
    chatId: string;
    conversationId: string;
    createdAt: number;
    completedAt: number;
  };
}

export interface WsChatCompleteResponseError extends WsBaseResponseError {
  action: WsAction.chatComplete;
  data: {
    chatId: string;
    conversationId: string;
    createdAt: number;
    completedAt: number;
    errors: { code: number; message: string }[];
  };
}

export class WsClearContextRequest extends WsBaseRequest {
  constructor() {
    super(WsAction.clearContext);
  }
}

export interface WsClearContextResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.clearContext;
}

export class WsInputAudioCompleteRequest extends WsBaseRequest {
  constructor(private readonly buffer: string) {
    super(WsAction.inputAudioComplete);
  }

  override serialize() {
    return {
      data: {
        buffer: this.buffer,
      },
    };
  }
}

export class WsInputAudioStreamRequest extends WsBaseRequest {
  constructor(private readonly buffer: string) {
    super(WsAction.inputAudioStream);
  }

  override serialize() {
    return {
      data: {
        buffer: this.buffer,
      },
    };
  }
}

export interface WsInputAudioCompleteResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.inputAudioComplete;
}

export interface WsOutputAudioCompleteResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.outputAudioComplete;
  data: {
    chatId: string;
    conversationId: string;
  };
}

export interface WsOutputAudioStreamResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.outputAudioStream;
  data: {
    chatId: string;
    conversationId: string;
    buffer: string;
  };
}

export interface WsOutputTextCompleteResponseSuccess
  extends Omit<WsOutputTextStreamResponseSuccess, 'action'> {
  action: WsAction.outputTextComplete;
}

export interface WsOutputTextStreamResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.outputTextStream;
  data: {
    chatId: string;
    conversationId: string;
    role: 'assistant' | 'user';
    text: string;
  };
}

export class WsUpdateConfigRequest extends WsBaseRequest {
  constructor(
    private readonly data: {
      conversationId?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
      outputText?: boolean;
      sampleRate?: {
        input?: number;
        output?: number;
      };
      speechRate?: number;
      voiceId?: string;
    },
  ) {
    super(WsAction.updateConfig);
  }

  override serialize() {
    return {
      data: this.data,
    };
  }
}

export interface WsUpdateConfigResponseSuccess extends WsBaseResponseSuccess {
  action: WsAction.updateConfig;
  data: {
    conversationId: string;
  };
}

export interface WsResponseMapping {
  [WsAction.cancelOutput]: WsCancelOutputResponseSuccess;
  [WsAction.chatComplete]: WsChatCompleteResponseSuccess | WsChatCompleteResponseError;
  [WsAction.clearContext]: WsClearContextResponseSuccess;
  [WsAction.inputAudioComplete]: WsInputAudioCompleteResponseSuccess;
  [WsAction.inputAudioStream]: WsInputAudioStreamRequest;
  [WsAction.outputAudioComplete]: WsOutputAudioCompleteResponseSuccess;
  [WsAction.outputAudioStream]: WsOutputAudioStreamResponseSuccess;
  [WsAction.outputTextComplete]: WsOutputTextCompleteResponseSuccess;
  [WsAction.outputTextStream]: WsOutputTextStreamResponseSuccess;
  [WsAction.updateConfig]: WsUpdateConfigResponseSuccess;
}

export type WsRequest =
  | WsUpdateConfigRequest
  | WsInputAudioStreamRequest
  | WsInputAudioCompleteRequest
  | WsClearContextRequest
  | WsCancelOutputResponseSuccess;

export type WsHandler<T> = (message: T) => Promise<void> | void;
