import { PasswordService } from './password.service.js';
import { UserRepo } from './user.repo.js';

export interface SigninParams {
  userName: string;
  password: string;
}

export interface SigninResult {
  authenticationResult: string;
  userId?: string;
  reason?: string;
}

export class SigninService {
  constructor(private pwds: PasswordService, private users: UserRepo) {}

  async signin(params: SigninParams): Promise<SigninResult> {
    const user = await this.users.findByUserName(params.userName);
    if (!user) {
      return { authenticationResult: 'failure', reason: 'user_not_found' };
    }

    const validPwd = await this.pwds.verify(user.passwordHash, params.password);
    if (!validPwd) {
      return { authenticationResult: 'failure', reason: 'invalid_password' };
    }

    return { authenticationResult: 'success', userId: user.id };
  }
}
