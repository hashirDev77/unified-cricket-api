import { ApiProperty } from '@nestjs/swagger';

/** Echoes back what the query actually narrowed on. */
export class AppliedFiltersDto {
  @ApiProperty({ nullable: true, type: String })
  format: string | null;
}
