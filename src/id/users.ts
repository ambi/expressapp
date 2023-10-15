import { MemoryDb, MemoryDbOptions } from '../db/memory-db.js';
import { User } from './user.js';
import { UserRepo } from './user.repo.js';

export class Users implements UserRepo {
  private db: MemoryDb<User>;

  constructor() {
    const options: MemoryDbOptions<User> = {
      // serialize,
      // deserialize,
      secondaryKeys: ['userName'],
    };
    this.db = new MemoryDb(options);
  }

  async get(id: string): Promise<User | undefined> {
    return await this.db.get(id);
  }

  async findByUserName(userName: string): Promise<User | undefined> {
    const users = await this.db.findBy('userName', userName);
    if (!users) return undefined;
    if (users.length === 0) return undefined;
    return users[0];
  }

  async save(user: User): Promise<void> {
    await this.db.save(user);
  }

  async delete(user: User): Promise<boolean> {
    return this.db.delete(user);
  }
}
