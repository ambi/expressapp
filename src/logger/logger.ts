export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SILENT = 'silent',
}

export interface Logger {
  debug(msg: string, args?: { [key: string]: any }): void;
  info(msg: string, args?: { [key: string]: any }): void;
  warn(msg: string, args?: { [key: string]: any }): void;
  error(msg: string, args?: { [key: string]: any }): void;
  get level(): LogLevel;
  set level(lv: LogLevel);
}
