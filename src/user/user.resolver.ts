import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../utils/guard/auth.guard';
import { AuthPayload, User } from './user.model';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Mutation(() => AuthPayload) //mutation to signup or login with your gmail account
    async authenticateWithGoogle(@Args('token') token: string, @Context() context): Promise<AuthPayload> {
        return this.userService.authenticate(token, context)
    }

    @Query(() => User)
    @UseGuards(new AuthGuard()) //Query to make sure that you are loggedin by providing token => retrieve User Data(id,name,etc...)
    async me(@Context('user') user): Promise<User> {
        return await this.userService.me(user.userId);
    }
}
