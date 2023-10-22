import { Logger as ActualPinoLogger } from 'pino';
import { Logger } from './logger.js';

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
}
