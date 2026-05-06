import { ApiProperty } from '@nestjs/swagger';
import { SessionDto } from './session.dto';

export class SessionAnswerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sessionQuestionId!: string;

  @ApiProperty()
  answerText!: string;

  @ApiProperty()
  aiFeedback!: string;

  @ApiProperty({ type: [String] })
  recommendations!: string[];

  @ApiProperty()
  score!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class SessionQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty({ nullable: true, type: String })
  questionId!: string | null;

  @ApiProperty()
  questionText!: string;

  @ApiProperty()
  difficulty!: number;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  isDivide!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [SessionAnswerDto] })
  answers!: SessionAnswerDto[];
}

export class SessionDetailDto extends SessionDto {
  @ApiProperty({ type: [SessionQuestionDto] })
  questions!: SessionQuestionDto[];
}
