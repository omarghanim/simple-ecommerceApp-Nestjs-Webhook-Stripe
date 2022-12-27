import { Injectable } from '@nestjs/common';
import { generate } from 'shortid';
import { GuestContext, UserContext } from 'src/user/user.model';
import { CookieService } from '../cookie/cookie.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
    constructor(private readonly prisma:PrismaService,private readonly cookieService:CookieService){}
    
    async addToCart(slug:string,quantity?:number,guest?:GuestContext,user?:UserContext,res?){
        const userId = user?.userId
        let guestId = guest?.guestId
   
        const productExists = await this.prisma.product.findUnique({where:{slug}})
        if(!productExists){
            throw new Error("Product not found")
        }
        const {id:productId,sku,price,discount,content} = productExists
        
        if(userId){
            const cartItem = await this.prisma.cartItem.findFirst({ where: { productId, cart: { userId, status: "cart" }, active: true } })
            if (cartItem) {
                
                await this.prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { increment: quantity } } })
                return true
            } 
            const cart = await this.prisma.cart.findFirst({where:{userId,status:"cart"},orderBy:{createdAt:"desc"}})
            if(cart){
                await this.prisma.cartItem.create({ data: { cartId: cart.id, productId, sku, price, discount, content, quantity}})
                return true
            }else{
                 await this.prisma.cart.create({data:{userId,status:"cart",cartItems:{
                    create:{
                        productId, sku, price, discount, content,quantity
                    }
                }
            }})
            return true
            }

        }else{
            if (!guestId) {
                guestId = generate()
                await this.cookieService.setCookieForUnLoggedUsers(res, guestId)
            }
            const cartExists = await this.prisma.cart.findFirst({where:{guestId,status:"cart"}})
            if(cartExists){
            const cartItem = await this.prisma.cartItem.findFirst({ where: { productId, cartId:cartExists.id, active: true } })
            if (cartItem) {
                await this.prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { increment: quantity } } })
                return true
            }
                await this.prisma.cartItem.create({ data: { cartId: cartExists.id, productId, sku, price, discount, content, quantity }})
                return true
        }
        await this.prisma.cart.create({data:{guestId,status:"cart",cartItems:{
            create:{
                productId, sku, price, discount, content, quantity
            }
        }}})
        return true
        };
    }

    async getCartItems(guest:GuestContext,user:UserContext){ //when user register update guest with userId
        const userId = user?.userId
        let guestId = guest?.guestId
         //find guest to add to it
         let cart = null
        if(userId){
            cart = await this.prisma.cart.findFirst({ where: { userId, status: { in: ["cart", "checkout"] } },orderBy:{createdAt:"desc"}})
            
         }else if(guestId){             
            cart = await this.prisma.cart.findFirst({ where: { guestId, status: { in: ["cart", "checkout"] } },orderBy:{createdAt:"desc"}})
            
         }else{
            return []
         }
         if(!cart){
            return []
         }
         return await this.prisma.cartItem.findMany({where:{cartId:cart.id,active:true }})
    }


}