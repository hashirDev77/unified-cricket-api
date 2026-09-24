import { Module } from '@nestjs/common';
import { MatchListModule } from 'src/modules/match-list/match-list.module';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repository';
import { SearchService } from './search.service';

@Module({
  imports: [MatchListModule],
  controllers: [SearchController],
  providers: [SearchRepository, SearchService],
})
export class SearchModule {}
