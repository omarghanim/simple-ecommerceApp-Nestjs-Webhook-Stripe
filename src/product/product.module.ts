import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
  providers: [ProductResolver, ProductService,PrismaService],
  exports:[ProductService]
})
export class ProductModule {}
