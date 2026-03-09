import {
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interview session' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(
      user.id,
      dto.technologyLevelId,
      dto.config || { format: 'text-text', questions_count: 10 },
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions for current user' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('lang') lang: string = 'en',
    @Query() pagination: PaginationDto,
  ) {
    return this.sessionsService.findAll(
      user.id,
      lang,
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findOne(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.sessionsService.findOne(id, user.id, lang);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a planned session — generates questions' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  start(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.sessionsService.start(id, user.id, lang);
  }

  @Get(':id/current-question')
  @ApiOperation({
    summary: 'Get the current question of an in-progress session',
  })
  currentQuestion(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.getCurrentQuestion(id, user.id);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip the current question (score = 0)' })
  skip(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.skip(id, user.id);
  }
}
