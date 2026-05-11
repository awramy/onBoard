import { ApiProperty } from '@nestjs/swagger';

export class AnswerNextQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  questionText!: string;

  @ApiProperty()
  difficulty!: number;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  isDivide!: boolean;

  @ApiProperty()
  isClarifying!: boolean;
}

export class AnswerResultDto {
  @ApiProperty()
  answerId!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  feedback!: string;

  @ApiProperty()
  isFullyClosed!: boolean;

  @ApiProperty({ type: [String] })
  recommendations!: string[];

  @ApiProperty()
  currentOrder!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  isFinished!: boolean;

  @ApiProperty({ nullable: true, type: AnswerNextQuestionDto })
  nextQuestion!: AnswerNextQuestionDto | null;
}
