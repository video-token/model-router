import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

import {
  ProviderSource,
  ProviderStatus,
} from '../entities/provider.entity';

export class CreateProviderDto {
  @IsString()
  @Length(2, 100)
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registryId?: string;

  @IsString()
  @Length(2, 120)
  name!: string;

  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @IsOptional()
  @IsEnum(ProviderSource)
  source?: ProviderSource;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  website?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  documentationUrl?: string;
}
