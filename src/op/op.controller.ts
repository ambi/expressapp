import { Request, Response } from 'express';

import { AuthorizeRequest, OpService } from './op.service.js';

export class OpController {
  constructor(private opSvc: OpService) {}

  async authorize(req: Request, res: Response) {
    const params: AuthorizeRequest = {
      responseType: req.body.response_type,
      clientId: req.body.client_id,
      redirectUri: req.body.redirect_uri,
      scope: spaceDelimitedList(req.body.scope),
      state: req.body.state,
    };
    await this.opSvc.authorize(params);
  }
}

function spaceDelimitedList(s: string | undefined) {
  if (s === undefined) return undefined;
  return s.split(' ');
}
