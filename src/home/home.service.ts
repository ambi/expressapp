import { User } from '../id/user.js';
import { UserRepo } from '../id/user.repo.js';

export interface HomeParams {
  userId: string;
}

export interface HomeResult {
  user: User;
}

export class HomeService {
  constructor(private users: UserRepo) { }

  async home(params: HomeParams): Promise<HomeResult> {
    const user = await this.users.get(params.userId);
    if (!user) throw new Error('user not found');

    return { user };
  }
}