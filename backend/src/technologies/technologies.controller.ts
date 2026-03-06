import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('technologies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/technologies')
export class TechnologiesController {
  constructor(private technologiesService: TechnologiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all technologies' })
  findAll() {
    return this.technologiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get technology by ID' })
  findOne(@Param('id') id: string) {
    return this.technologiesService.findOne(id);
  }
}
