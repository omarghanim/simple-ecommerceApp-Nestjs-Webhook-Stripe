import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoGuard } from '../utils/guard/noGuard';
import { Order } from './order.model';
import { OrderService } from './order.service';
import { CreateOrderInput } from './orderDto/createOrder.dto';

@Resolver()
export class OrderResolver {
    constructor(private readonly orderService:OrderService){}

    @UseGuards(new NoGuard())
    @Query(()=>[Order])
    async getMyOrders(@Context('user') user?, @Context() context?){
        let guest = context.req.cookies          
        return this.orderService.getMyOrders(user,guest)
    }

    @UseGuards(new NoGuard())
    @Mutation(()=>Order)
    async makeOrder(@Args('cartId',{type:()=>Int})cartId:number,@Args('data')data:CreateOrderInput,@Context() context?, @Context('user') user?){
        let guest = context.req.cookies          
        return this.orderService.makeOrder(cartId,data,guest,user)
    }


}
