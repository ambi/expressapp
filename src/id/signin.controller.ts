import { Request, Response } from 'express';
import { z } from 'zod';

import { Config } from '../config/config.js';
import { SigninService, SigninParams } from './signin.service.js';
import { Session } from './session.js';

export const SigninRequest = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

declare module 'express-session' {
  interface SessionData {
    authentication_result: string | null;
    user_id: string | null;
    post_signin: string | null;
  }
}

export function getSession(req: Request): Session {
  return {
    authenticationResult: req.session.authentication_result,
    userId: req.session.user_id,
    postSignin: req.session.post_signin,
  };
}

export async function saveSession(req: Request, session: Session) {
  if (session.authenticationResult !== undefined) {
    req.session.authentication_result = session.authenticationResult;
  }
  if (session.userId !== undefined) {
    req.session.user_id = session.userId;
  }
  if (session.postSignin !== undefined) {
    req.session.post_signin = session.postSignin;
  }

  return new Promise<Error | undefined>((resolve, reject) => {
    req.session.save(resolve);
  });
}

export async function resetSession(req: Request) {
  return new Promise<Error | undefined>((resolve, reject) => {
    req.session.regenerate(resolve);
  });
}

export const DEFAULT_POST_SIGNIN = '/home';

export class SigninController {
  constructor(
    private cfg: Config,
    private signinSvc: SigninService,
  ) {
  }

  async signinPage(req: Request, res: Response) {
    res.status(200).render('../src/id/views/signin', {
      csrfToken: req.csrfToken(),
      errorMessages: req.flash('error')
    });
  }

  async signin(req: Request, res: Response) {
    const valid = SigninRequest.safeParse(req.body);
    if (!valid.success) {
      req.flash('error', 'Signin failed');
      res.redirect(this.cfg.signinPath);
      return;
    }

    const params: SigninParams = {
      userName: valid.data.username,
      password: valid.data.password,
    };
    const result = await this.signinSvc.signin(params);

    if (result.authenticationResult === 'failure') {
      req.flash('error', 'Signin failed');
      res.redirect(this.cfg.signinPath);
      return;
    }

    const postSignin = getSession(req).postSignin;

    // Reset the session against session fixation attacks.
    await resetSession(req);
    await saveSession(req, result);

    res.redirect(postSignin || DEFAULT_POST_SIGNIN);
  }

  async signout(req: Request, res: Response) {
    await saveSession(req, {
      authenticationResult: null,
      userId: null,
    });

    // TODO: redirect to the post-signout endpoint.
  }
}
