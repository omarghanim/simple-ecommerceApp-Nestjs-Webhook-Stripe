import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateOrderInput{  
    @Field({nullable:true})
    promo:string

    @Field({nullable:true})
    firstName?: string

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
}