import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CookieService } from '../cookie/cookie.service';

@Module({
  providers: [UserResolver, UserService,PrismaService,CookieService],
  exports:[UserService],
})
export class UserModule {}
