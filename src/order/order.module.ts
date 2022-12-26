import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

@Module({
    providers:[OrderResolver,OrderService,PrismaService],
    exports:[OrderService]
})
export class OrderModule {}
