import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/identity/identity.module';
import { MatchListModule } from 'src/modules/match-list/match-list.module';
import { RecordsModule } from 'src/modules/records/records.module';
import { TeamsController } from './teams.controller';
import { TeamsRepository } from './teams.repository';
import { TeamsService } from './teams.service';

@Module({
  imports: [IdentityModule, MatchListModule, RecordsModule],
  controllers: [TeamsController],
  providers: [TeamsRepository, TeamsService],
})
export class TeamsModule {}
