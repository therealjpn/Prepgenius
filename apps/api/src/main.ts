import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin: string, callback: any) => {
      const allowed = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ].filter(Boolean);
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || allowed.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('prepgenie.xyz')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in early stage — tighten later
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  const token = process.env.ALOC_ACCESS_TOKEN;
  const squad = process.env.SQUAD_SECRET_KEY;
  console.log(`\n🇳🇬 PrepGenie API running on port ${port}`);
  console.log(`   ALOC: ${token ? '✅ Connected' : '⚠️ Not configured'}`);
  console.log(`   Squad: ${squad ? '✅ Configured' : '⚠️ Demo Mode'}\n`);
}
bootstrap();
