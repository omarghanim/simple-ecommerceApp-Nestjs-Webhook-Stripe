import { Body, Controller, Get, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import {Request,Response} from 'express'
@Controller('stripe')
export class StripeController {
    constructor(private stripeService:StripeService){}

    @Post('checkout')
    checkout(@Req() req: Request, @Res() res: Response,@Body() order){
        try{                        
            return this.stripeService.checkout(req,res,order)
        }catch(err){
            return err;
        }
    }

    
    @Post('webhook')
    webhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response){
        return this.stripeService.webhook(req,res)
    }

    @Get('success')
    async success(@Res()res:Response){
        res.send("Success")
    }
}
