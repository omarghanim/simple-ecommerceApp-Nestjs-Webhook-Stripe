import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CookieController } from './cookie.controller';
import { CookieService } from './cookie.service';

@Module({
  providers:[CookieService,CookieController,PrismaService],
  exports:[CookieService],
  controllers: [CookieController]
})
export class CookieModule {}
