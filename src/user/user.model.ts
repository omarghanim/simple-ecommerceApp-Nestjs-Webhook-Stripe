import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(() => ID)
    id: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field(() => Date, { nullable: true })
    birthDate?: Date

    @Field({ nullable: true })
    country?: string;

    @Field({ nullable: true })
    gender?: string;

    @Field({ nullable: true })
    picture?: string;

    @Field()
    type:string

    @Field(() => Int)
    tokenVersion?: number;

    @Field(() => Date)
    createdAt?: Date;

    @Field(() => Date, { nullable: true })
    updatedAt?: Date;
}

@ObjectType()
export class AuthPayload {
    @Field()
    accessToken: string;
    @Field({ nullable: true })
    refreshToken?: string;
}

export class UserInput{
    email:string
    firstName:string
    lastName:string
    picture?:string
}

export type UserContext = {
    userId:string
    userType:string
}

export type GuestContext = {
    guestId:string
}