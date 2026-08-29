import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreateProvidersTable1788062400000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'providers',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '100',
            isPrimary: true,
          },
          {
            name: 'registryId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
            default: "'active'",
          },
          {
            name: 'source',
            type: 'varchar',
            length: '32',
            default: "'manual'",
          },
          {
            name: 'website',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'documentationUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('providers');
  }
}
