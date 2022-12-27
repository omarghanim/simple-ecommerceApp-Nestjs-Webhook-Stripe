import { Injectable } from '@nestjs/common';
import { GuestContext, UserContext } from '../user/user.model';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './orderDto/createOrder.dto';
import 'isomorphic-fetch';


@Injectable()
export class OrderService {
    constructor(private readonly prisma:PrismaService){}

    promoCodes = {
        'OURAPP': 25,
        'THEBEST': 50,
        'FAVOURITE': 70
    }

    async getMyOrders(user:UserContext,guest:GuestContext){
        const userId = user?.userId
        let guestId = guest?.guestId

        if(userId){ //user get his order and order items
            return await this.prisma.order.findMany({
                where: {
                    userId,status:"paid"
                }, include: {
                    orderItems: {include:{product:{}}} //include product from order items to get product data
                }, orderBy: { createdAt: "desc" }
            })
        }else{ //user who not logged in can get his order if he still has a session(guestId)
            return await this.prisma.order.findMany({
                where: {
                    guestId, status: "paid"
                }, include: {
                    orderItems: { include: { product: {} } }
                }, orderBy: { createdAt: "desc" }
            })
        }  
    }

    async makeOrder(cartId: number, data: CreateOrderInput, guest: GuestContext, user:UserContext) {
        const userId:string = user?.userId
        let guestId:string = guest?.guestId
        let userData 

        //we can get user data if user logged in , also he can send new data
        if(userId){ 
            const user =await this.prisma.user.findFirst({where:{id:userId}})
            userData = {
                userId,
                firstName:user.firstName,
                lastName:user.lastName,
                country:user.country,
                email:user.email,
                mobile:user.mobile
            }
        }else{
            userData = {
                guestId
            }
        }
        
        //verify that required data was filled
        await this.verifyUserData(userData,data)

        //get products from cart
        const selectedProducts = await this.prisma.cartItem.findMany({ where: { cartId},select:{productId:true,price:true,discount:true,sku:true,quantity:true,content:true} })

        //is user the owner of cart or cart status is "cart"
        //is product still active 
        await this.isProductActive(userId, guestId, cartId, selectedProducts)

        //calculate tax , discount(promo code) and total
        const calculations = await this.calculateTotal(selectedProducts,data.promo)
        
        //create new order with order items
        const order =  await this.prisma.order.create({
            data:{
                ...userData,
                ...data,
                ...calculations,
               status: "new",
                orderItems:{
                    createMany:{
                        data:selectedProducts
                    }
                }
            }
        })

        await fetch(`http://localhost:5000/stripe/checkout`, {
            method: 'POST', headers: {
                // Check what headers the API needs. A couple of usuals right below
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        body: JSON.stringify(order) }).then(async(response)=>{
            if(response.status===200){    
                const url = response.url            
                console.log(url);
                //get the guestId from url because there is no guestId in this response
                //we can get guestId when checkout and make update for order status but we didn't do that to reduce queries to db
                const sessionId = url.substring(url.indexOf("cs_test"), url.indexOf('#'))
                //update status and stripeId
                await this.prisma.cart.update({ where: { id: cartId }, data: { status: "checkout",sessionId } })
                await this.prisma.order.update({ where: { id: order.id }, data: { status: "checkout",sessionId } })
            }else{
                return response.status    
            }
        }).catch(err=>{throw new Error(err)})
        
        return order
    }

    async isProductActive(userId:string,guestId:string,cartId:number,selectedPoducts){
        let cartOwner = null
        if(userId){
            cartOwner = await this.prisma.cart.findFirst({ where: { id:cartId,userId,status:{in:["cart","checkout"]} } })
        }else if(guestId){
            cartOwner = await this.prisma.cart.findFirst({ where: { id: cartId, guestId, status: { in: ["cart", "checkout"] } } })
        }else{
            throw new Error("Wrong request!")
        }
        if(!cartOwner){  //if the cart not in status cart or he not the owner will result to error(invalid cart)
            throw new Error("Invalid cart !")
        }
        const productIds = selectedPoducts.map((prod)=>prod.productId)
        if(productIds.length===0){
            throw new Error("Your cart is empty!")
        }
        const products = await this.prisma.product.findMany({where:{id:{in:productIds}}})
        for(let i =0 ; i<products.length ; i++){
            if(!products[i].active){
                throw new Error(`Product ${products[i].title} has been deactivated from supplier,you must remove it from cart`)
            }
        }
        return true
    }

    async calculateTotal(selectedProducts,promo:string){
        let p = selectedProducts
        let total = 0
        let subTotal = 0;
        let itemDiscount = 0
        let discount = 0

        let tax = 2
        let shipping = 25
        for(let i=0 ; i<p.length ; i++){ 
            let price = p[i].price
            let productDiscount = p[i].discount
            let quantity = p[i].quantity
            subTotal = subTotal + (price - price*productDiscount/100)*quantity
            itemDiscount = itemDiscount + (price*productDiscount/100)*quantity
        }
        
        total = (subTotal + subTotal*tax/100 + shipping)
        let grandTotal = total
            if(promo in this.promoCodes ){
                discount = this.promoCodes[promo]
                grandTotal = total -total*discount/100
            }
        return {subTotal,itemDiscount,tax,shipping,total,discount,grandTotal}
    }

    async verifyUserData(userData,data) {
        if(!userData.email && !data.email){
            throw new Error("You must fill your email")
        }
        if (!userData.mobile && !data.mobile) {
            throw new Error("You must write your mobile")
        }
        if( (!userData.firstName || !userData.lastName) && (!data.firstName || !data.lastName) ){
            throw new Error("You must fill first name and last name")
        }
        return true
    }
      
    
}
