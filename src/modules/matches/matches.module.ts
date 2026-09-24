import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/identity/identity.module';
import { MatchListModule } from 'src/modules/match-list/match-list.module';
import { RecordsModule } from 'src/modules/records/records.module';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { MatchesService } from './matches.service';

@Module({
  imports: [IdentityModule, MatchListModule, RecordsModule],
  controllers: [MatchesController],
  providers: [MatchesRepository, MatchesService],
})
export class MatchesModule {}
