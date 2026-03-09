import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Module({
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
