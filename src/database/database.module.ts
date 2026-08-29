import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateProvidersTable1788062400000 } from './migrations/1788062400000-CreateProvidersTable';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',

      database:
        process.env.MODEL_ROUTER_DB_PATH ??
        'model-router.sqlite',

      autoLoadEntities: true,

      migrations: [
        CreateProvidersTable1788062400000,
      ],

      // Database structure is managed only by migrations.
      synchronize: false,

      // Do not silently change a production database on startup.
      migrationsRun: false,
    }),
  ],
})
export class DatabaseModule {}
