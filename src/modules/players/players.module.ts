import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/identity/identity.module';
import { PlayersController } from './players.controller';
import { PlayersRepository } from './players.repository';
import { PlayersService } from './players.service';
import { VersusRepository } from './versus.repository';
import { VersusService } from './versus.service';

@Module({
  imports: [IdentityModule],
  controllers: [PlayersController],
  providers: [PlayersRepository, PlayersService, VersusRepository, VersusService],
})
export class PlayersModule {}
