import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
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
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findAll(@Query('lang') lang: string = 'en') {
    return this.technologiesService.findAll(lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get technology by ID' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findOne(@Param('id') id: string, @Query('lang') lang: string = 'en') {
    return this.technologiesService.findOne(id, lang);
  }
}
