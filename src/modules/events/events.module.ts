import { Module } from '@nestjs/common';
import { IdentityModule } from 'src/modules/identity/identity.module';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

@Module({
  imports: [IdentityModule],
  controllers: [EventsController],
  providers: [EventsRepository, EventsService],
})
export class EventsModule {}
