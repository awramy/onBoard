import { ApiProperty } from '@nestjs/swagger';
import { SessionDto } from './session.dto';
import { CurrentQuestionDto } from './current-question.dto';

export class StartResultDto extends SessionDto {
  @ApiProperty()
  declare totalQuestions: number;

  @ApiProperty({ nullable: true, type: CurrentQuestionDto })
  currentQuestion!: CurrentQuestionDto | null;
}
