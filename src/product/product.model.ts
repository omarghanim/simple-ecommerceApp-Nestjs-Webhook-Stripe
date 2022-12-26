import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Product {
    @Field(()=>ID)
    id:string

    @Field()
    slug:string

    @Field()
    userId:string

    @Field()
    title: string

    @Field({ nullable: true })
    metaTitle?: string

    @Field()
    categoryId: string

    @Field()
    price: number

    @Field()
    sku: string

    @Field(() => Int)
    quantity: number

    @Field({ nullable: true })
    image?: string

    @Field({ nullable: true })
    desc?: string

    @Field({ nullable: true })
    summary?: string

    @Field({ nullable: true })
    discount?: number

    @Field({ nullable: true })
    content?: string

    @Field(()=>Boolean)
    active:boolean

    @Field(()=>Date)
    createdAt:Date

    @Field(()=>Date,{nullable:true})
    upatedAt?:Date
}