import * as cheerio from 'cheerio';
import setCookie from 'set-cookie-parser';
import supertest from 'supertest';

import { createApp } from '../../src/app/app.js';
import { Config } from '../../src/config/config.js';
import { User } from '../../src/id/models/user.js';
import { Users } from '../../src/id/repositories/users.js';
import { PasswordService } from '../../src/id/services/password.service.js';

const cfg: Config = {
  port: 8080,
  sessionSecret: 'test-secret',
  homePath: '/home',
  signinPath: '/signin',
  authorizePath: '/authorize',
  tokenPath: '/token',
};
const users = new Users();
const app = createApp(cfg, users);

describe('GET /signin', () => {
  it('returns the signin page', async () => {
    const res = await supertest(app).get('/signin');
    expect(res.status).toBe(200);
    expect(res.text).toMatch('username');
    expect(res.text).toMatch('csrf');
  });
});

describe('GET /home', () => {
  it('redirects to the signin page (unauthenticated)', async () => {
    const res = await supertest(app).get('/home');
    expect(res.status).toBe(302);
    expect(res.headers.location).toEqual('/signin');
  });

  it('returns the home page (authenticated)', async () => {
    const pwdSvc = new PasswordService();
    const userPassword = 'p@ssw0rd!';
    const user: User = {
      id: 'USER_ID1',
      userName: 'user1@example.com',
      passwordHash: await pwdSvc.createHash(userPassword),
      attrs: [],
    };
    await users.save(user);

    let res = await supertest(app).get('/home');
    expect(res.status).toBe(302);
    let location = res.headers.location;
    expect(location).toEqual('/signin');
    let sCookies = setCookie(res.headers['set-cookie']);
    let cookies = sCookies.map((c) => `${c.name}=${c.value}`).join('; '); // TODO

    res = await supertest(app).get(location).set('cookie', cookies);
    expect(res.status).toBe(200);
    const dollar = cheerio.load(res.text);
    const csrfToken = dollar('#signin-csrf').attr('value');

    res = await supertest(app)
      .post(location)
      .set('cookie', cookies)
      .send(`username=${user.userName}`)
      .send(`password=${userPassword}`)
      .send(`_csrf=${csrfToken}`);
    expect(res.status).toBe(302);
    location = res.headers.location;
    expect(location).toEqual('/home');
    sCookies = setCookie(res.headers['set-cookie']);
    cookies = sCookies.map((c) => `${c.name}=${c.value}`).join('; '); // TODO

    res = await supertest(app).get(location).set('cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.text).toMatch(`User name: ${user.userName}`);
  });
});
