import { ConflictException, Injectable } from '@nestjs/common';

import { CreateProviderDto } from './dto/create-provider.dto';
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

  create(input: CreateProviderDto): ProviderView {
    const exists = this.providers.some(
      (provider) => provider.id === input.id,
    );

    if (exists) {
      throw new ConflictException(
        `Provider '${input.id}' already exists.`,
      );
    }

    const provider: ProviderView = {
      id: input.id,
      registryId: input.registryId ?? null,
      name: input.name,
      status: input.status ?? ProviderStatus.ACTIVE,
      source: input.source ?? ProviderSource.MANUAL,
      website: input.website ?? null,
      documentationUrl: input.documentationUrl ?? null,
    };

    this.providers.push(provider);

    return provider;
  }
}
