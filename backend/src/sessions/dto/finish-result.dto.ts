import { ApiProperty } from '@nestjs/swagger';

export class FinishResultDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  totalQuestions!: number;

  @ApiProperty()
  questionsAnswered!: number;

  @ApiProperty()
  avgScore!: number;

  @ApiProperty()
  sessionScore!: number;

  @ApiProperty()
  newFullScore!: number;

  @ApiProperty()
  newLeague!: string;
}
