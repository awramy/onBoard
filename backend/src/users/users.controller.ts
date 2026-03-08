import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Get('me/progress')
  @ApiOperation({ summary: 'Get aggregated progress by technologies → topics' })
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
    @Query('technologyLevelId') technologyLevelId: string,
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
    @Query('topicId') topicId: string,
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

  @Get()
  @ApiOperation({ summary: 'Get all users (leaderboard)' })
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }
}
