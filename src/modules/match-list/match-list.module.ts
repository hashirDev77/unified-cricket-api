import { Module } from '@nestjs/common';
import { MatchListRepository } from './match-list.repository';
import { MatchListService } from './match-list.service';

@Module({
  providers: [MatchListRepository, MatchListService],
  exports: [MatchListRepository, MatchListService],
})
export class MatchListModule {}
