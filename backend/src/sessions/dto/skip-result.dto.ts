import { ApiProperty } from '@nestjs/swagger';

export class SkipResultDto {
  @ApiProperty()
  skipped!: boolean;

  @ApiProperty()
  currentOrder!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  isFinished!: boolean;
}
