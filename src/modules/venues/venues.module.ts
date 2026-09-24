import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/identity/identity.module';
import { MatchListModule } from 'src/modules/match-list/match-list.module';
import { VenuesController } from './venues.controller';
import { VenuesRepository } from './venues.repository';
import { VenuesService } from './venues.service';

@Module({
  imports: [IdentityModule, MatchListModule],
  controllers: [VenuesController],
  providers: [VenuesRepository, VenuesService],
})
export class VenuesModule {}
