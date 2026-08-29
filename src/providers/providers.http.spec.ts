import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';

describe('Providers API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Every test gets its own clean in-memory SQLite database.
    process.env.MODEL_ROUTER_DB_PATH = ':memory:';

    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    const dataSource =
      moduleFixture.get(DataSource);

    // Test the real migration path instead of synchronize:true.
    await dataSource.runMigrations();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    delete process.env.MODEL_ROUTER_DB_PATH;
  });

  it('GET /v1/admin/providers should return an empty provider list', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/admin/providers')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('POST /v1/admin/providers should create a provider', async () => {
    const input = {
      id: 'provider_easyrouter',
      registryId: 'easyrouter',
      name: 'EasyRouter',
      source: 'registry',
      website: 'https://easyrouter.io',
      documentationUrl: 'https://docs.easyrouter.io',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/admin/providers')
      .send(input)
      .expect(201);

    expect(response.body).toEqual({
      id: 'provider_easyrouter',
      registryId: 'easyrouter',
      name: 'EasyRouter',
      status: 'active',
      source: 'registry',
      website: 'https://easyrouter.io',
      documentationUrl: 'https://docs.easyrouter.io',
    });
  });

  it('created provider should appear in GET /v1/admin/providers', async () => {
    await request(app.getHttpServer())
      .post('/v1/admin/providers')
      .send({
        id: 'provider_easyrouter',
        registryId: 'easyrouter',
        name: 'EasyRouter',
        source: 'registry',
        website: 'https://easyrouter.io',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/v1/admin/providers')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(
      'provider_easyrouter',
    );
  });

  it('duplicate provider id should return 409', async () => {
    const input = {
      id: 'provider_easyrouter',
      name: 'EasyRouter',
    };

    await request(app.getHttpServer())
      .post('/v1/admin/providers')
      .send(input)
      .expect(201);

    await request(app.getHttpServer())
      .post('/v1/admin/providers')
      .send(input)
      .expect(409);
  });

  it('invalid website URL should return 400', async () => {
    await request(app.getHttpServer())
      .post('/v1/admin/providers')
      .send({
        id: 'provider_test',
        name: 'Test Provider',
        website: 'not-a-valid-url',
      })
      .expect(400);
  });

  it('unknown fields should return 400', async () => {
    await request(app.getHttpServer())
      .post('/v1/admin/providers')
      .send({
        id: 'provider_test',
        name: 'Test Provider',
        apiKey: 'this-field-must-not-be-accepted',
      })
      .expect(400);
  });
});
