import { Logger as ActualPinoLogger } from 'pino';
import { LogLevel, Logger } from './logger.js';

export class PinoLogger implements Logger {
  constructor(public pino: ActualPinoLogger) {}

  debug(msg: string, args: { [key: string]: any } = {}): void {
    this.pino.debug(args, msg);
  }

  info(msg: string, args: { [key: string]: any } = {}): void {
    this.pino.info(args, msg);
  }

  warn(msg: string, args: { [key: string]: any } = {}): void {
    this.pino.warn(args, msg);
  }

  error(msg: string, args: { [key: string]: any } = {}): void {
    this.pino.error(args, msg);
  }

  get level(): LogLevel {
    switch (this.pino.level) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      case 'silent':
        return LogLevel.SILENT;
      default:
        // When the level is unsupported, change the level to INFO.
        this.pino.level = 'info';
        return LogLevel.INFO;
    }
  }

  set level(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        this.pino.level = 'debug';
        return;
      case LogLevel.INFO:
        this.pino.level = 'info';
        return;
      case LogLevel.WARN:
        this.pino.level = 'warn';
        return;
      case LogLevel.ERROR:
        this.pino.level = 'error';
        return;
      case LogLevel.SILENT:
        this.pino.level = 'silent';
        return;
    }
  }
}
