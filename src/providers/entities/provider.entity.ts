import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProviderStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  MAINTENANCE = 'maintenance',
}

export enum ProviderSource {
  REGISTRY = 'registry',
  MANUAL = 'manual',
}

@Entity({ name: 'providers' })
export class ProviderEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registryId!: string | null;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: ProviderStatus.ACTIVE,
  })
  status!: ProviderStatus;

  @Column({
    type: 'varchar',
    length: 32,
    default: ProviderSource.MANUAL,
  })
  source!: ProviderSource;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentationUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
