import { Request } from 'express';

export interface Context {
  [key: string]: any;
}

export function contextFromRequest(req: Request) {
  return {
    req: {
      id: req.id,
    },
  };
}
