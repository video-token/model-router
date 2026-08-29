import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    HealthModule,
    ProvidersModule,
  ],
})
export class AppModule {}
