import supertest from 'supertest';

import { app } from '../../main';
import { App } from '../../app';

let application: App;

beforeAll(async () => {
  application = app;
});

describe('AuthController', () => {
  test('cant create existed user', async () => {
    const res = await supertest(application.app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '43443431' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Unique constraint failed on the fields/);
  });
});

afterAll(() => {
  application.close();
});
