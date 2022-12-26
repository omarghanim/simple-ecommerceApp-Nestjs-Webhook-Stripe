import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartResolver } from './cart/cart.resolver';
import { CartService } from './cart/cart.service';
import { CartModule } from './cart/cart.module';
import { OrderResolver } from './order/order.resolver';
import { OrderModule } from './order/order.module';
import { CookieModule } from './cookie/cookie.module';
import { CookieController } from './cookie/cookie.controller';
import { StripeModule } from './stripe/stripe.module';
import { StripeController } from './stripe/stripe.controller';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: 'src/schema.gql',
    context: ({ req, res }) => ({
      headers: req.headers,
      req,
      res,
      url: req.protocol + '://' + req.headers.host,
    }),
    //typePaths: ['./**/*.graphql'],
    //path:"/",
  }), 
  UserModule, ProductModule, CartModule, OrderModule, CookieModule, StripeModule],
  controllers: [CookieController,StripeController],
  //providers: [CartResolver, CartService, OrderResolver],
})
export class AppModule {}
