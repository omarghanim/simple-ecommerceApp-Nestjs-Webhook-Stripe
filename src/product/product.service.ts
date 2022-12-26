import { Injectable } from '@nestjs/common';
import { generate } from 'shortid';
import { UserContext } from '../user/user.model';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './productDto/createProduct.dto';
var slugify = require('slugify')

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async addProduct(data: CreateProductInput,user:UserContext){
        const {userId} = user
        const userExists = await this.prisma.user.findUnique({where:{id:userId}})
        if(!userExists){
            throw new Error("User not found")
        }
                // if you need to make some restrictions to make just vendor or supplier user to add product
      //  if(!userExists.vendor){
        //    throw new Error("You have no permissions to add product ; you can contact us")
      //  }

        
        return await this.prisma.product.create({
          data:{
            ...data,
            userId,
            slug: slugify(data.title+'-sku' +data.sku.slice(0, 5)+'-ourapp'+generate().slice(0,3), { lower: true, remove: /[*+/~,.()'"!:@]/g })
        }  
        }).catch(err=>{throw new Error("some error occurred , may be sku is repeated  .. you can try again")})
    }

}
