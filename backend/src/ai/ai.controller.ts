import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { TestAiModelDto } from './dto/test-ai-model.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('providers')
  @ApiOperation({
    summary: 'List registered AI providers, models, and routing aliases',
  })
  getProviders() {
    return {
      hasProviders: this.aiService.hasProviders(),
      providers: this.aiService.getProviderRegistrations(),
    };
  }

  @Post('test')
  @ApiOperation({
    summary: 'Run a lightweight test request against one or all AI models',
  })
  @ApiBody({ type: TestAiModelDto, required: false })
  testModels(@Body() dto: TestAiModelDto = {}) {
    return this.aiService.testModels(dto.model, dto.operation ?? 'evaluate');
  }
}
