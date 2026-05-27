// Logger interface and no-op implementation for browser use.

type LogData = Record<string, unknown>;

export interface ILogger {
  info(message: string, request: Request | undefined, data: LogData): void;
  error(message: string, request: Request | undefined, data: LogData): void;
}

export class NoopLogger implements ILogger {
  info(_message: string, _request: Request | undefined, _data: LogData): void {}
  error(_message: string, _request: Request | undefined, _data: LogData): void {}
}
