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
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { SessionDto, SessionsListDto } from './dto/session.dto';
import { SessionDetailDto } from './dto/session-detail.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { FindSessionsQueryDto } from './dto/find-sessions-query.dto';
import { CurrentQuestionDto } from './dto/current-question.dto';
import { AnswerResultDto } from './dto/answer-result.dto';
import { SkipResultDto } from './dto/skip-result.dto';
import { FinishResultDto } from './dto/finish-result.dto';
import { AbandonResultDto } from './dto/abandon-result.dto';
import { StartResultDto } from './dto/start-result.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interview session' })
  @ApiCreatedResponse({ type: SessionDto })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(
      user.id,
      dto.technologyLevelId,
      dto.config || { format: 'text-text', questions_count: 10 },
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions for current user' })
  @ApiOkResponse({ type: SessionsListDto })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('lang') lang: string = 'en',
    @Query() query: FindSessionsQueryDto,
  ) {
    return this.sessionsService.findAll(user.id, lang, {
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      status: query.status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  @ApiOkResponse({ type: SessionDetailDto })
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
  @ApiOkResponse({ type: StartResultDto })
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
  @ApiOkResponse({ type: CurrentQuestionDto })
  currentQuestion(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.getCurrentQuestion(id, user.id);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip the current question (score = 0)' })
  @ApiOkResponse({ type: SkipResultDto })
  skip(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.skip(id, user.id);
  }

  @Post(':id/answer')
  @ApiOperation({
    summary: 'Submit an answer; AI evaluates, updates progress, advances',
  })
  @ApiOkResponse({ type: AnswerResultDto })
  answer(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.sessionsService.answer(id, user.id, dto.answerText);
  }

  @Post(':id/finish')
  @ApiOperation({
    summary: 'Finish session — compute score, update user league',
  })
  @ApiOkResponse({ type: FinishResultDto })
  finish(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.finish(id, user.id);
  }

  @Post(':id/abandon')
  @ApiOperation({
    summary: 'Abandon session early — progress on answered questions is kept',
  })
  @ApiOkResponse({ type: AbandonResultDto })
  abandon(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.abandon(id, user.id);
  }
}
