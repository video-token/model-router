import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database:
        process.env.MODEL_ROUTER_DB_PATH ??
        'model-router.sqlite',

      autoLoadEntities: true,

      // Production schema changes must use migrations.
      synchronize: false,
      migrationsRun: false,
    }),
  ],
})
export class DatabaseModule {}
