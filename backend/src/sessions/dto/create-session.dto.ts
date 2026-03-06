import { IsUUID, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'Technology level ID' })
  @IsUUID()
  technologyLevelId: string;

  @ApiProperty({
    description: 'Session config',
    default: { format: 'text-text', questions_count: 10 },
  })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
