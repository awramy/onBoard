import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    description: 'Candidate answer text',
    example:
      'HTTP is a stateless protocol used for client-server communication',
  })
  @IsString()
  @MinLength(1)
  answerText: string;
}
