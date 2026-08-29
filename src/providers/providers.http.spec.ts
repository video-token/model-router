import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../app.module';

describe('Providers API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('v1');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/admin/providers should return an empty provider list', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/admin/providers')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
