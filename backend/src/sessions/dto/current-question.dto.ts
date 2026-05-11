import { ApiProperty } from '@nestjs/swagger';

export class CurrentQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true, type: String })
  questionId!: string | null;

  @ApiProperty()
  questionText!: string;

  @ApiProperty()
  difficulty!: number;

  @ApiProperty()
  isDivide!: boolean;

  @ApiProperty()
  isClarifying!: boolean;

  @ApiProperty()
  order!: number;

  @ApiProperty({ nullable: true, type: Number })
  totalQuestions!: number | null;
}
