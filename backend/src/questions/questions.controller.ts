import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get questions by topic ID (without explanation)' })
  @ApiQuery({ name: 'topicId', required: true, description: 'Topic UUID' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findAll(
    @Query('topicId', ParseUUIDPipe) topicId: string,
    @Query('lang') lang: string = 'en',
    @Query() pagination: PaginationDto,
  ) {
    return this.questionsService.findByTopic(
      topicId,
      lang,
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID with explanation' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findOne(@Param('id') id: string, @Query('lang') lang: string = 'en') {
    return this.questionsService.findOne(id, lang);
  }
}
