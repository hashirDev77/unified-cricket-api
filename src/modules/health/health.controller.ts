import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Liveness probe backed by a database round trip.',
    description:
      'Returns a status string only, after issuing a trivial query against the unified database.\n' +
      'It touches no cricket tables, so it reports nothing about either feed.',
  })
  async check(): Promise<{ status: string }> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok' };
  }
}
