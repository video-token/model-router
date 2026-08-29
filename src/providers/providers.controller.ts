import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateProviderDto } from './dto/create-provider.dto';
import {
  ProvidersService,
  ProviderView,
} from './providers.service';

@Controller('admin/providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
  ) {}

  @Get()
  async findAll(): Promise<ProviderView[]> {
    return this.providersService.findAll();
  }

  @Post()
  async create(
    @Body() input: CreateProviderDto,
  ): Promise<ProviderView> {
    return this.providersService.create(input);
  }
}
