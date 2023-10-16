import { Config } from '../config/config.js';
import { Users } from '../id/repositories/users.js';
import { createApp } from './app.js';

// import dotenv from 'dotenv';
// dotenv.config();

const cfg: Config = {
  port: 8080,
  sessionSecret: 'secret',
  homePath: '/home',
  signinPath: '/signin',
  authorizePath: '/authorize',
  tokenPath: '/token',
};
const users = new Users();
const app = createApp(cfg, users);

app.listen(cfg.port, () => {
  console.log(`Example app listening on port ${cfg.port}`);
});
