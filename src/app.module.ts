import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
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

  }),
    UserModule, ProductModule, CartModule, OrderModule, CookieModule, StripeModule],
  controllers: [CookieController, StripeController],
})
export class AppModule { }
