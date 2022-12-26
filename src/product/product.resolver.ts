import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../utils/guard/auth.guard';
import { Product } from './product.model';
import { ProductService } from './product.service';
import { CreateProductInput } from './productDto/createProduct.dto';

@Resolver()
export class ProductResolver {
    constructor(private readonly productService:ProductService){}

    @UseGuards(new AuthGuard())
    @Mutation(()=>Product)
    async addProduct(@Args('data') data: CreateProductInput, @Context('user') user,){
        return this.productService.addProduct(data,user)
    }
}
