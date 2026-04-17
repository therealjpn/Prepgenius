import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { AlocService } from './aloc.service';

@Module({
  controllers: [ExamController],
  providers: [ExamService, AlocService],
})
export class ExamModule {}
