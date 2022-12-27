import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AdminGuard } from '../utils/guard/admin.guard';
import { StripeService } from './stripe.service';

@Resolver()
export class StripeResolver {
    constructor(private readonly stripeService:StripeService){}

    @UseGuards(new AdminGuard()) //Just admin who can execute this query //to be ADMIN you can modify type from database(User Table)
    @Query(()=>String)
    async getOrderStatusFromStripe(@Args('id',{type:()=>Int})id:number){
        return this.stripeService.getOrderStatusFromStripe(id)
    }
}
