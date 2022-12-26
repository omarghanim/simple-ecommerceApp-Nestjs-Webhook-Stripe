import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoGuard } from '../utils/guard/noGuard';
import { CartItem } from './cart.model';
import { CartService } from './cart.service';

@Resolver()
export class CartResolver {
    constructor(private readonly cartService:CartService){}

    @UseGuards(new NoGuard())
    @Mutation(()=>Boolean)
    async addToCart(@Args('slug')slug:string,@Args('quantity',{type:()=>Int,nullable:true,defaultValue:1})quantity?:number,
    @Context() context?,@Context('user') user?){
        let guest = context.req.cookies      
        let res = context.res 
        return this.cartService.addToCart(slug,quantity,guest,user,res)
    }

    @UseGuards(new NoGuard())
    @Query(() => [CartItem])
    async getCartItems(@Context() context?, @Context('user') user?) {
        let guest = context.req.cookies          
        return this.cartService.getCartItems(guest, user)
    }
}
