import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';

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
  findAll(@CurrentUser() user: { id: string }) {
    return this.sessionsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.sessionsService.findOne(id, user.id);
  }
}
