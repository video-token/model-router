import { Controller, Get } from '@nestjs/common';
import { ProvidersService, ProviderView } from './providers.service';

@Controller('admin/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll(): ProviderView[] {
    return this.providersService.findAll();
  }
}
