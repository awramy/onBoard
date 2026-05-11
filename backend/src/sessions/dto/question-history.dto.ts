import { ApiProperty } from '@nestjs/swagger';

export class QuestionHistoryItemDto {
  @ApiProperty()
  sessionQuestionId!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  questionText!: string;

  @ApiProperty()
  answerText!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class QuestionHistoryDto {
  @ApiProperty({ type: [QuestionHistoryItemDto] })
  items!: QuestionHistoryItemDto[];
}
