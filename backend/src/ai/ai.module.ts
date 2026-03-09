import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { AiController } from './ai.controller';

@Global()
@Module({
  controllers: [AiController],
  providers: [GeminiProvider, OpenAiProvider, AiService],
  exports: [AiService],
})
export class AiModule {}
