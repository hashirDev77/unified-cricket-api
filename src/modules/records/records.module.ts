import { Module } from '@nestjs/common';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service';

@Module({
  providers: [RecordsRepository, RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
