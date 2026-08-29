import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { ProviderEntity } from '../providers/entities/provider.entity';
import { CreateProvidersTable1788062400000 } from './migrations/1788062400000-CreateProvidersTable';

const AppDataSource = new DataSource({
  type: 'sqlite',

  database:
    process.env.MODEL_ROUTER_DB_PATH ??
    'model-router.sqlite',

  entities: [
    ProviderEntity,
  ],

  migrations: [
    CreateProvidersTable1788062400000,
  ],

  synchronize: false,
  migrationsRun: false,
});

export default AppDataSource;
