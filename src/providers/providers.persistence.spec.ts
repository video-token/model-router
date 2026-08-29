import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { DataSource } from 'typeorm';

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AppModule } from '../app.module';

describe('Providers persistence', () => {
  let tempDirectory: string;

  async function createApp(): Promise<INestApplication> {
    const moduleFixture =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    const dataSource =
      moduleFixture.get(DataSource);

    await dataSource.runMigrations();

    const app =
      moduleFixture.createNestApplication();

    app.setGlobalPrefix('v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    return app;
  }

  beforeEach(() => {
    tempDirectory = mkdtempSync(
      join(tmpdir(), 'model-router-'),
    );

    process.env.MODEL_ROUTER_DB_PATH =
      join(tempDirectory, 'router.sqlite');
  });

  afterEach(() => {
    delete process.env.MODEL_ROUTER_DB_PATH;

    rmSync(tempDirectory, {
      recursive: true,
      force: true,
    });
  });

  it('should keep providers after router restart', async () => {
    const firstApp = await createApp();

    await request(firstApp.getHttpServer())
      .post('/v1/admin/providers')
      .send({
        id: 'provider_easyrouter',
        registryId: 'easyrouter',
        name: 'EasyRouter',
        source: 'registry',
        website: 'https://easyrouter.io',
      })
      .expect(201);

    await firstApp.close();

    // Simulate a complete Router restart
    // while keeping the same SQLite database.
    const secondApp = await createApp();

    const response = await request(
      secondApp.getHttpServer(),
    )
      .get('/v1/admin/providers')
      .expect(200);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      id: 'provider_easyrouter',
      registryId: 'easyrouter',
      name: 'EasyRouter',
      status: 'active',
      source: 'registry',
      website: 'https://easyrouter.io',
    });

    await secondApp.close();
  });
});
