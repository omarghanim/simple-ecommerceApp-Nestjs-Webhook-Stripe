import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../user/user.model";

@ObjectType()
export class Cart {
    @Field(()=>Int)
    id:string
    @Field({nullable:true})
    userId?:string
    @Field({nullable:true})
    guestId?:string
    @Field()
    status:string
    @Field(()=>User,{nullable:true})
    user?:User
    @Field(() => Date)
    createdAt: Date;
    @Field(() => Date, { nullable: true })
    updatedAt?: Date;
}

@ObjectType()
export class CartItem {
    @Field(() => Int)
    id: number
    @Field(()=>Int)
    cartId:number
    @Field(()=>String)
    productId:string
    @Field()
    sku:string
    @Field()
    price:number
    @Field()
    discount:number
    @Field(()=>Int)
    quantity:number
    @Field(()=>Boolean)
    active:boolean
    @Field({nullable:true})
    content?:string
    @Field(() => Date)
    createdAt: Date;
    @Field(() => Date, { nullable: true })
    updatedAt?: Date;
}

