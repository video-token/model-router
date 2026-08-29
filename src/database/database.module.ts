import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateProvidersTable1788062400000 } from './migrations/1788062400000-CreateProvidersTable';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        type: 'sqlite' as const,

        database:
          configService.get<string>(
            'MODEL_ROUTER_DB_PATH',
          ) ?? 'model-router.sqlite',

        autoLoadEntities: true,

        migrations: [
          CreateProvidersTable1788062400000,
        ],

        synchronize: false,
        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
