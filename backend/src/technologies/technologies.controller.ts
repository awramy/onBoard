import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('technologies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/technologies')
export class TechnologiesController {
  constructor(private technologiesService: TechnologiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all technologies' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findAll(
    @Query('lang') lang: string = 'en',
    @Query() pagination: PaginationDto,
  ) {
    return this.technologiesService.findAll(
      lang,
      pagination.skip ?? 0,
      pagination.take ?? 50,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get technology by ID' })
  @ApiQuery({ name: 'lang', required: false, example: 'en' })
  findOne(@Param('id') id: string, @Query('lang') lang: string = 'en') {
    return this.technologiesService.findOne(id, lang);
  }
}
