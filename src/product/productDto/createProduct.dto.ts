import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateProductInput {
    @Field()
    title:string

    @Field({nullable:true})
    metaTitle?:string

    @Field()
    categoryId:string

    @Field()
    price:number

    @Field()
    sku:string

    @Field(()=>Int)
    quantity:number

    @Field({nullable:true})
    image?:string

    @Field({nullable:true})
    desc?:string

    @Field({nullable:true})
    summary?:string

    @Field({nullable:true})
    discount?:number

    @Field({ nullable: true })
    content?: string
}