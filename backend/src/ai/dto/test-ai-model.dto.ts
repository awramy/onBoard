import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { AiTestOperation } from '../ai.interfaces';

export class TestAiModelDto {
  @ApiPropertyOptional({
    description:
      'Specific model name or alias to test. If omitted, all available configured models are tested.',
    examples: ['auto', 'gemini', 'gemini-2.5-pro', 'openai', 'gpt-4.1-mini'],
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Which AI flow to verify with the test request',
    enum: ['evaluate', 'generate'],
    default: 'evaluate',
  })
  @IsOptional()
  @IsIn(['evaluate', 'generate'])
  operation?: AiTestOperation;
}
