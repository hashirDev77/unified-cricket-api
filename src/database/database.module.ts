import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from 'src/config/env.schema';
import { CRICKET_ENTITIES } from './entities';
import { applyPgTypeParsers } from './pg-type-parsers';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        applyPgTypeParsers();
        return {
          type: 'postgres' as const,
          url: config.get('DATABASE_URL', { infer: true }),
          entities: CRICKET_ENTITIES,
          synchronize: false,
          migrationsRun: false,
          logging: false,
          extra: {
            max: config.get('DB_POOL_MAX', { infer: true }),
            options: '-c search_path=cricket,public -c default_transaction_read_only=on',
          },
        };
      },
    }),
    TypeOrmModule.forFeature(CRICKET_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
