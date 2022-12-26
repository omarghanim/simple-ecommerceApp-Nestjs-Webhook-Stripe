import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeResolver } from './stripe.resolver';

@Module({
  controllers: [StripeController],
  providers: [StripeResolver,StripeService, StripeController,PrismaService],
  exports:[StripeService]
})
export class StripeModule {}
