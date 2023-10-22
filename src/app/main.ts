import { Users } from '../id/repositories/users.js';
import { createApp, defaultConfig } from './app.js';

async function main() {
  const cfg = defaultConfig;
  const users = new Users();
  const app = createApp(cfg, users);

  app.listen(cfg.port, () => {
    console.log(`Example app listening on port ${cfg.port}`);
  });
}

main().catch(console.error);
