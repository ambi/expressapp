import { Request, Response } from 'express';
import { z } from 'zod';

import { Config } from '../../config/config.js';
import { AuthenticationResult } from '../models/session.js';
import { SigninParams, SigninService } from '../services/signin.service.js';
import { getSession, resetSession, saveSession } from './session.js';

export const SigninRequest = z
  .object({
    username: z.string().min(1),
    password: z.string().min(1),
  })
  .transform(
    (x) =>
      <SigninParams>{
        userName: x.username,
        password: x.password,
      },
  );

export const DEFAULT_POST_SIGNIN = '/home';

export class SigninController {
  constructor(private cfg: Config, private signinSvc: SigninService) {}

  async signinPage(req: Request, res: Response) {
    res.status(200).render('../src/id/views/signin', {
      csrfToken: req.csrfToken(),
      errorMessages: req.flash('error'),
    });
  }

  async signin(req: Request, res: Response) {
    const valid = SigninRequest.safeParse(req.body);
    if (!valid.success) {
      req.flash('error', 'Signin failed');
      res.redirect(this.cfg.signinPath);
      return;
    }

    const result = await this.signinSvc.signin(valid.data);

    if (result.authenticationResult !== AuthenticationResult.SUCCESS) {
      req.flash('error', 'Signin failed');
      res.redirect(this.cfg.signinPath);
      return;
    }

    const session = { ...getSession(req), ...result };
    // Reset the session against session fixation attacks.
    await resetSession(req);
    await saveSession(req, session);

    res.redirect(session.postSignin || DEFAULT_POST_SIGNIN);
  }

  async signout(req: Request, res: Response) {
    await saveSession(req, {
      authenticationResult: null,
      userId: null,
    });

    // TODO: redirect to the post-signout endpoint.
  }
}
