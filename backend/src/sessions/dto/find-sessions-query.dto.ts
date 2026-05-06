import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindSessionsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Фильтр по статусу. Передаётся через запятую: ?status=planned,in_progress',
    example: 'in_progress,planned',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
