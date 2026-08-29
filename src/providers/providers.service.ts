import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProviderDto } from './dto/create-provider.dto';
import {
  ProviderEntity,
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
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
  ) {}

  async findAll(): Promise<ProviderView[]> {
    const providers = await this.providerRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });

    return providers.map((provider) =>
      this.toView(provider),
    );
  }

  async create(
    input: CreateProviderDto,
  ): Promise<ProviderView> {
    const existing =
      await this.providerRepository.findOneBy({
        id: input.id,
      });

    if (existing) {
      throw new ConflictException(
        `Provider '${input.id}' already exists.`,
      );
    }

    const provider = this.providerRepository.create({
      id: input.id,
      registryId: input.registryId ?? null,
      name: input.name,
      status:
        input.status ?? ProviderStatus.ACTIVE,
      source:
        input.source ?? ProviderSource.MANUAL,
      website: input.website ?? null,
      documentationUrl:
        input.documentationUrl ?? null,
    });

    const saved =
      await this.providerRepository.save(provider);

    return this.toView(saved);
  }

  private toView(
    provider: ProviderEntity,
  ): ProviderView {
    return {
      id: provider.id,
      registryId: provider.registryId,
      name: provider.name,
      status: provider.status,
      source: provider.source,
      website: provider.website,
      documentationUrl:
        provider.documentationUrl,
    };
  }
}
