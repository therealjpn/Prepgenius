import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  const token = process.env.ALOC_ACCESS_TOKEN;
  const paystack = process.env.PAYSTACK_SECRET_KEY;
  console.log(`\n🇳🇬 PrepGenius API running on port ${port}`);
  console.log(`   ALOC: ${token ? '✅ Connected' : '⚠️ Not configured'}`);
  console.log(`   Paystack: ${paystack ? '✅ Configured' : '⚠️ Test Mode'}\n`);
}
bootstrap();
