import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
export class ExamController {
  constructor(private examService: ExamService) {}

  @Get('subjects')
  getSubjects() {
    return this.examService.getSubjects();
  }

  @Get('exam/demo')
  getDemoQuestions(@Query('subject') subject: string) {
    return this.examService.getDemoQuestions(subject);
  }

  @Post('exam/demo/submit')
  submitDemo(@Body() body: { subject: string; answers: Record<number, string>; questions: any[] }) {
    return this.examService.submitDemo(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('exam/start')
  startExam(@Req() req: any, @Body() body: { subject: string; examType?: string; year?: string; questionCount?: number }) {
    return this.examService.startExam(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('exam/submit')
  submitExam(@Req() req: any, @Body() body: { sessionId: number; answers: Record<number, string> }) {
    return this.examService.submitExam(req.user.userId, body);
  }
}
