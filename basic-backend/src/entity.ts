
export interface EnqueMessagePayload {
  messageId: number;
}

export interface EnqueMessageResponse {
  result: string;
  receivedMessageId: number;
}
