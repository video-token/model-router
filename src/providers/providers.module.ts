import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderEntity } from './entities/provider.entity';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderEntity,
    ]),
  ],
  controllers: [
    ProvidersController,
  ],
  providers: [
    ProvidersService,
  ],
  exports: [
    ProvidersService,
  ],
})
export class ProvidersModule {}
