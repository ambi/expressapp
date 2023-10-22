import * as cheerio from 'cheerio';
import setCookie from 'set-cookie-parser';
import supertest from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { createApp, defaultConfig } from '../../src/app/app.js';
import { createTestData } from '../../src/app/test-data.js';
import { User } from '../../src/id/models/user.js';
import { Users } from '../../src/id/repositories/users.js';
import { PasswordService } from '../../src/id/services/password.service.js';

const cfg = defaultConfig;
const users = new Users();
const app = createApp(cfg, users);
let testData: { users: User[]; userPasswords: string[] };

beforeAll(async () => {
  testData = await createTestData(users);
});

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
    let res = await supertest(app).get('/home');
    expect(res.status).toBe(302);
    let location = res.headers.location;
    expect(location).toEqual('/signin');
    let sCookies = setCookie(res.headers['set-cookie']);
    let cookies = sCookies.map((c) => `${c.name}=${c.value}`).join('; ');

    res = await supertest(app).get(location).set('cookie', cookies);
    expect(res.status).toBe(200);
    const dollar = cheerio.load(res.text);
    const csrfToken = dollar('#signin-csrf').attr('value');

    res = await supertest(app)
      .post(location)
      .set('cookie', cookies)
      .send(`username=${testData.users[0].userName}`)
      .send(`password=${testData.userPasswords[0]}`)
      .send(`_csrf=${csrfToken}`);
    expect(res.status).toBe(302);
    location = res.headers.location;
    expect(location).toEqual('/home');
    sCookies = setCookie(res.headers['set-cookie']);
    cookies = sCookies.map((c) => `${c.name}=${c.value}`).join('; ');

    res = await supertest(app).get(location).set('cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.text).toMatch(`User name: ${testData.users[0].userName}`);
  });
});
