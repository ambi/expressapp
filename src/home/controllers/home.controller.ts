import { Request, Response } from 'express';

import { Config } from '../../config/config.js';
import { getSession, saveSession } from '../../id/controllers/session.js';
import { HomeService } from '../services/home.service.js';

export class HomeController {
  constructor(private cfg: Config, private homeSvc: HomeService) {}

  async home(req: Request, res: Response) {
    const session = getSession(req);
    if (session.authenticationResult !== 'success' || !session.userId) {
      await saveSession(req, {
        postSignin: this.cfg.homePath,
      });
      res.redirect(this.cfg.signinPath);
      return;
    }

    const params = { userId: session.userId };
    const result = await this.homeSvc.home(params);

    res.status(200).render('../src/home/views/home', { user: result.user });
  }
}
