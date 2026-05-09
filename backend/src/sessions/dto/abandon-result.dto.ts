import { ApiProperty } from '@nestjs/swagger';

export class AbandonResultDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  status!: string;
}
