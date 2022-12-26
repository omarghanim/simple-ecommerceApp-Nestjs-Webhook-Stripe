import { Injectable, RawBodyRequest } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Stripe } from 'stripe';
import { Order } from '../order/order.model';
import { Request, Response } from 'express'

@Injectable()
export class StripeService {
    private stripe;

    constructor(private readonly prisma:PrismaService){
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY,{
            apiVersion:"2022-11-15"
        })
    }
        
    async checkout(req:Request,res:Response,order:Order){
        try {                    
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [{//here we just pass the order not orderItems ;  but you can pass all order items
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: order.id, 
                            },
                        unit_amount: +order.grandTotal.toFixed(2)*100,
                        },
                        quantity: 1,
                }],
                success_url: `${process.env.CLIENT_URL}/success`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
            })            
           req.header['userData']={orderId:order.id,userId:order.userId,guestId:order.guestId}
           res.redirect(session.url)
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    }

    async webhook(req: RawBodyRequest<Request>,res:Response){
        const sig = req.headers['stripe-signature'];        
        let event;
        
        try {
            event = this.stripe.webhooks.constructEvent(req.rawBody, sig, process.env.WEBHOOK_SECRET);
        }
        catch (err) {
            res.status(400).send(`Webhook Error: ${err}`);
        }

        // Handle the event
        
        if (event.type === 'checkout.session.completed' || event.type ==='checkout.session.async_payment_succeeded') {
            
            const session = event.data.object
            //save record in transaction table 
            await this.saveTransaction(session, req.header['userData'])

            //update status of order to complete
            await this.updateOrderStatus(session)

        } else if (event.type ==='checkout.session.async_payment_failed'){
            const session = event.data.object
            await this.saveTransaction(session, req.header['userData'])

            // you can send an email to the customer asking them to retry their order
           //ex: emailCustomerAboutFailedPayment(session);

            //update status of order to paid
           await this.updateOrderStatus(session)
           
           res.status(400)
           res.json({received:false})
        }

        // Return a response to acknowledge receipt of the event
        res.status(200);
        res.json({ received: true });
        
    }

    async getOrderStatusFromStripe(id:number){ //retrieve payments from stripe to check if order paid or not in case of we need to be sure of the status or if we have a problem in database and status didn't changed
        const order = await this.prisma.order.findUnique({where:{id}}) //order id
        if(!order){
            throw new Error("No session")
        }
       const session = await this.stripe.checkout.sessions.retrieve(order.sessionId).catch(err=>{throw new Error("No session")})
       return session.payment_status
    }

    async updateOrderStatus(session){
        await this.prisma.order.update({ where: { sessionId: session.id }, data: { status: session.payment_status } })
        await this.prisma.cart.update({ where: { sessionId: session.id }, data: { status: session.payment_status } })
    }
    
    async saveTransaction(session,userData){
        if(userData.userId){
            userData.guestId=null
        }
        await this.prisma.transaction.create({
            data:{
                userId:userData?.userId,
                guestId:userData?.guestId,
                sessionId:session.id,
                email:session.customer_details.email,
                orderId:userData.orderId,
                type: session.payment_method_types[0],
                mode: 'online',
                status:session.payment_status,
                total:session.amount_total/100,
            }
        })
    }
}
