
declare type ListenerType<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];
declare class EventEmitter<TEventRecord = {}> {
  static defaultMaxListeners: number;
  on<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: ListenerType<TEventRecord[P]>) => void
  ): this;

  once<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: ListenerType<TEventRecord[P]>) => void
  ): this;

  off<P extends keyof TEventRecord, T>(
    this: T,
    event: P,
    listener: (...args: any[]) => any
  ): this;

  removeAllListeners<P extends keyof TEventRecord, T>(this: T, event?: P): this;
  listeners<P extends keyof TEventRecord, T>(this: T, event: P): Function[];
  rawListeners<P extends keyof TEventRecord, T>(this: T, event: P): Function[];
  listenerCount<P extends keyof TEventRecord, T>(this: T, event: P): number;
}

interface ChannelAttributeProperties {
  value: string;

  lastUpdateUserId: string;

  lastUpdateTs: number;
}

interface AttributesMap {

  [key: string]: string;
}
interface ChannelAttributes {
  [key: string]: ChannelAttributeProperties;
}

interface ChannelAttributeOptions {
  enableNotificationToChannelMembers?: boolean;
}

declare namespace RtmStatusCode {
    enum ConnectionChangeReason {
        LOGIN = "LOGIN",
        LOGIN_SUCCESS = "LOGIN_SUCCESS",
        LOGIN_FAILURE = "LOGIN_FAILURE",
        LOGIN_TIMEOUT = "LOGIN_TIMEOUT",
        INTERRUPTED = "INTERRUPTED",
        LOGOUT = "LOGOUT",
        BANNED_BY_SERVER = "BANNED_BY_SERVER",
        REMOTE_LOGIN = "REMOTE_LOGIN"
    }
    enum ConnectionState {
        DISCONNECTED = "DISCONNECTED",
        CONNECTING = "CONNECTING",
        CONNECTED = "CONNECTED",
        RECONNECTING = "RECONNECTING",
        ABORTED = "ABORTED"
    }
    enum MessageType {
        TEXT = "TEXT"
    }
}

interface RtmTextMessage {
  text: string;

  messageType?: 'TEXT';
}

type RtmMessage = RtmTextMessage;

interface PeerMessageSendResult {
  hasPeerReceived: boolean;
}

interface SendMessageOptions {
  enableOfflineMessaging?: boolean;
  enableHistoricalMessaging?: boolean;
}

interface ReceivedMessageProperties {
  serverReceivedTs: number;
  isOfflineMessage: boolean;
  isHistoricalMessage: boolean;
}

declare namespace RtmEvents {
  export interface RtmChannelEvents {
    ChannelMessage: (
      message: RtmMessage,
      memberId: string,
      messagePros: ReceivedMessageProperties
    ) => void;

    MemberLeft: (memberId: string) => void;

    MemberJoined: (memberId: string) => void;

    AttributesUpdated: (attributes: ChannelAttributes) => void;
  }

  export interface RtmClientEvents {
    MessageFromPeer: (
      message: RtmMessage,
      peerId: string,
      messageProps: ReceivedMessageProperties
    ) => void;
    ConnectionStateChanged: (
      newState: keyof typeof RtmStatusCode.ConnectionState,
      reason: keyof typeof RtmStatusCode.ConnectionChangeReason
    ) => void;
    TokenExpired: () => void;
  }
}

declare class RtmChannel extends EventEmitter<
  RtmEvents.RtmChannelEvents
> {
  readonly channelId: string;

  sendMessage(
    message: RtmMessage,
    messageOptions?: SendMessageOptions
  ): Promise<void>;

  join(): Promise<void>;

  leave(): Promise<void>;

  getMembers(): Promise<string[]>;

  on<EventName extends keyof RtmEvents.RtmChannelEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RtmChannelEvents[EventName]>
    ) => any
  ): this;
}

type LogFilterType = {
  error: boolean;
  warn: boolean;
  info: boolean;
  track: boolean;
  debug: boolean;
};

interface RtmParameters {
  enableLogUpload?: boolean;

  logFilter?: LogFilterType;
}

declare class RtmClient extends EventEmitter<RtmEvents.RtmClientEvents> {
  login(options: { uid: string; token?: string }): Promise<void>;

  logout(): Promise<void>;

  sendMessageToPeer(
    message: RtmMessage,
    peerId: string,
    options?: SendMessageOptions
  ): Promise<PeerMessageSendResult>;

  createChannel(channelId: string): RtmChannel;

  getChannelAttributes(channelId: string): Promise<ChannelAttributes>;

  getChannelAttributesByKeys(
    channelId: string,
    keys: string[]
  ): Promise<ChannelAttributes>;

  clearChannelAttributes(
    channelId: string,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  deleteChannelAttributesByKeys(
    channelId: string,
    attributeKeys: string[],
    options?: ChannelAttributeOptions
  ): Promise<void>;

  addOrUpdateChannelAttributes(
    channelId: string,
    attributes: AttributesMap,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  setChannelAttributes(
    channelId: string,
    attributes: AttributesMap,
    options?: ChannelAttributeOptions
  ): Promise<void>;

  renewToken(token: string): Promise<void>;

  setParameters(params: RtmParameters): void;

  on<EventName extends keyof RtmEvents.RtmClientEvents>(
    eventName: EventName,
    listener: (
      ...args: ListenerType<RtmEvents.RtmClientEvents[EventName]>
    ) => any
  ): this;
}

declare namespace AgoraRTM {
  const LOG_FILTER_OFF: LogFilterType;
  const LOG_FILTER_ERROR: LogFilterType;
  const LOG_FILTER_INFO: LogFilterType;
  const LOG_FILTER_WARNING: LogFilterType;
  const VERSION: string;

  const BUILD: string;

  const END_CALL_PREFIX: string;

  function createInstance(appId: string, params?: RtmParameters): RtmClient;
  const ConnectionChangeReason: typeof RtmStatusCode.ConnectionChangeReason;
  const ConnectionState: typeof RtmStatusCode.ConnectionState;
  const MessageType: typeof RtmStatusCode.MessageType;
}

export = AgoraRTM;
export as namespace AgoraRTM;
