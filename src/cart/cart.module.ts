import { Module } from '@nestjs/common';
import { CookieService } from '../cookie/cookie.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
    providers:[CartResolver,CartService,PrismaService,CookieService],
    exports:[CartService]
})
export class CartModule {}
