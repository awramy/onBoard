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
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserMeDto } from './dto/user-me.dto';
import { UserLeaderboardItemDto } from './dto/user-leaderboard-item.dto';
import { UserProgressTechnologyDto } from './dto/user-progress.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserMeDto })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Get('me/progress')
  @ApiOperation({ summary: 'Get aggregated progress by technologies → topics' })
  @ApiOkResponse({ type: [UserProgressTechnologyDto] })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  getProgress(
    @CurrentUser() user: { id: string },
    @Query('lang') lang: string = 'en',
  ) {
    return this.usersService.getAggregatedProgress(user.id, lang);
  }

  @Get('me/progress/topics')
  @ApiOperation({ summary: 'Get progress by topics for a technology level' })
  @ApiQuery({ name: 'technologyLevelId', required: true })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  getTopicProgress(
    @CurrentUser() user: { id: string },
    @Query('technologyLevelId', ParseUUIDPipe) technologyLevelId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.usersService.getTopicProgress(user.id, technologyLevelId, lang);
  }

  @Get('me/progress/questions')
  @ApiOperation({ summary: 'Get progress by questions for a topic' })
  @ApiQuery({ name: 'topicId', required: true })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  getQuestionProgress(
    @CurrentUser() user: { id: string },
    @Query('topicId', ParseUUIDPipe) topicId: string,
    @Query('lang') lang: string = 'en',
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getQuestionProgress(
      user.id,
      topicId,
      lang,
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }

  @Get('me/questions/:questionId/history')
  @ApiOperation({
    summary:
      'Get full answer history of the current user for a specific question',
  })
  @ApiParam({ name: 'questionId', required: true })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  getQuestionAnswerHistory(
    @CurrentUser() user: { id: string },
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.usersService.getQuestionAnswerHistory(
      user.id,
      questionId,
      lang,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (leaderboard)' })
  @ApiOkResponse({ type: [UserLeaderboardItemDto] })
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }
}
