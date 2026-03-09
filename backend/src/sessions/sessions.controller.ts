import {
  Controller,
  Get,
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
    @Param('id') id: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.sessionsService.findOne(id, user.id, lang);
  }
}
