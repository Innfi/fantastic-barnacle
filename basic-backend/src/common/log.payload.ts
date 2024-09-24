export const EVENT_LOG_HTTP = 'log_http';
export const EVENT_WORKLOAD_HANDLER_RESP = 'workload_handler_resp';

export interface HttpLogPayload {
  request: {
    transactionId: string;
    path: string;
    query: object;
    params: object;
    body: object;
  };
  response: object;
}
