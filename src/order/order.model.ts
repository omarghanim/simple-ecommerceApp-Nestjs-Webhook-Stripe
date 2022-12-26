import { Field,Int,ObjectType } from "@nestjs/graphql";
import { User } from "../user/user.model";
import { Product } from "../product/product.model";

@ObjectType()
export class Order {
    @Field(() => Int)
    id: number

    @Field({nullable:true})
    userId?:string

    @Field({ nullable: true })
    guestId?: string

    @Field({ nullable: true })
    sessionId?: string

    @Field()
    status:string

    @Field()
    subTotal:number

    @Field()
    itemDiscount: number

    @Field()
    tax: number

    @Field()
    shipping: number

    @Field()
    total: number

    @Field({nullable:true})
    promo?: string

    @Field()
    discount: number

    @Field()
    grandTotal: number

    @Field({nullable:true})
    firstName?:string

    @Field({ nullable: true })
    lastName?: string

    @Field({ nullable: true })
    email?: string

    @Field({ nullable: true })
    mobile?: string

    @Field({ nullable: true })
    address?: string

    @Field({ nullable: true })
    city?: string
    
    @Field({ nullable: true })
    province?: string

    @Field({ nullable: true })
    country?: string

    @Field({ nullable: true })
    content?: string

    @Field(() => User, { nullable: true })
    user?: User

    @Field(() => [OrderItem], { nullable: true })
    orderItems?: OrderItem[]

    @Field(() => Date)
    createdAt: Date

    @Field(() => Date, { nullable: true })
    updatedAt?: Date

   // @Field(()=>Transaction)
   // transaction:Transaction
}



@ObjectType()
export class OrderItem{
    @Field(()=>Int)
    id:number

    @Field()
    productId:string

    @Field(()=>Int)
    orderId:number

    @Field()
    sku:string

    @Field()
    price:number

    @Field()
    discount:number

    @Field(()=>Int)
    quantity:number

    @Field({nullable:true})
    content?:string

    @Field(()=>Product)
    product:Product

    @Field(()=>Date)
    createdAt:Date

    @Field(() => Date,{nullable:true})
    updatedAt?: Date
}



