import { Context } from '../../context/context.js';
import { Logger } from '../../logger/logger.js';
import { AuthenticationResult } from '../models/session.js';
import { PasswordService } from './password.service.js';
import { UserRepo } from './user.repo.js';

export interface SigninParams {
  userName: string;
  password: string;
}

export interface SigninResult {
  authenticationResult: AuthenticationResult;
  userId?: string;
  reason?: string;
}

export class SigninService {
  constructor(private logger: Logger, private pwds: PasswordService, private users: UserRepo) {}

  async signin(ctx: Context, params: SigninParams): Promise<SigninResult> {
    const user = await this.users.findByUserName(params.userName);
    if (!user) {
      this.logger.warn('signin: user not found', { userName: params.userName, ctx });
      return { authenticationResult: AuthenticationResult.FAILURE, reason: 'user_not_found' };
    }

    const validPwd = await this.pwds.verify(user.passwordHash, params.password);
    if (!validPwd) {
      this.logger.warn('signin: invalid password', { userName: params.userName, ctx });
      return { authenticationResult: AuthenticationResult.FAILURE, reason: 'invalid_password' };
    }

    this.logger.info('signin: password authentication succeeded', { userName: params.userName, ctx });
    return { authenticationResult: AuthenticationResult.SUCCESS, userId: user.id };
  }
}
