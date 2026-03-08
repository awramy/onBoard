import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'Get topics by technology level ID' })
  @ApiQuery({
    name: 'levelId',
    required: true,
    description: 'Technology level UUID',
  })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findAll(
    @Query('levelId') levelId: string,
    @Query('lang') lang: string = 'en',
    @Query() pagination: PaginationDto,
  ) {
    return this.topicsService.findByLevel(
      levelId,
      lang,
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID with questions count' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findOne(@Param('id') id: string, @Query('lang') lang: string = 'en') {
    return this.topicsService.findOne(id, lang);
  }
}
