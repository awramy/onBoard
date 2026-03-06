import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('api')
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
