import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { QuestionGeneratorService } from './question-generator.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [ProgressModule],
  controllers: [SessionsController],
  providers: [SessionsService, QuestionGeneratorService],
  exports: [SessionsService],
})
export class SessionsModule {}
