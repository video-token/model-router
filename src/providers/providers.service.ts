import { Injectable } from '@nestjs/common';
import {
  ProviderSource,
  ProviderStatus,
} from './entities/provider.entity';

export interface ProviderView {
  id: string;
  registryId: string | null;
  name: string;
  status: ProviderStatus;
  source: ProviderSource;
  website: string | null;
  documentationUrl: string | null;
}

@Injectable()
export class ProvidersService {
  private readonly providers: ProviderView[] = [];

  findAll(): ProviderView[] {
    return this.providers;
  }
}
