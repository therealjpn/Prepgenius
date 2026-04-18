import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [SupportController],
})
export class SupportModule {}
