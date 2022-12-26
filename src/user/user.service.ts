import { Injectable } from '@nestjs/common';
import { google, Auth} from 'googleapis';
import { CookieService } from '../cookie/cookie.service';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserInput } from './user.model';

@Injectable()
export class UserService {
    oauthClient: Auth.OAuth2Client;
    constructor(
        private readonly prisma: PrismaService, private readonly cookieService:CookieService
    ) {
        const clientID = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET

        this.oauthClient = new google.auth.OAuth2(
            clientID,
            clientSecret,
        );
    }

    async authenticate(token: string, ctx) {
        const res = ctx.res
        const req = ctx.req
        //token : you should get this access token from client side , then get profile data from it
        const tokenInfo = await this.oauthClient.verifyIdToken({ idToken: token }).catch(err=>{throw new Error("Invalid token!")});

        const email = tokenInfo.getPayload().email;

        try { //signIn level
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {            //signUp level
                return this.registerUser(token, email, res,req);
            }

            return this.handleRegisteredUser(user, res,req);
        } catch (error) {
            if (error.status !== 404) {
                throw new error;
            }
        }
    }

    async handleRegisteredUser(user:User, res,req) {
        const refreshToken = await this.cookieService.createRefreshToken(user.id, user.tokenVersion);
        const accessToken = await this.cookieService.createAccessToken(user.id, user.type);

        await this.cookieService.sendRefereshToken(res, refreshToken);
        const guestId = req?.cookies?.guestId
        if(guestId){ //if user has session(guestId from cookie) we can move his cart and order to his account when registered and loggedIn
            const cartExists = await this.prisma.cart.findFirst({ where: { guestId,status:"CART"},orderBy:{createdAt:"desc"} })
            const orderExists = await this.prisma.order.findFirst({where:{guestId},orderBy:{createdAt:"desc"}})
            if(cartExists){
                await this.prisma.cart.update({where:{id:cartExists.id},data:{userId:user.id,guestId:null}})
            }
            if(orderExists){
                await this.prisma.order.update({where:{id:orderExists.id},data:{userId:user.id,guestId:null}})
            }
        } 
        return {
            accessToken,
            refreshToken,
        };
    }

    async getUserData(token: string) {
        const tokenInfo = await this.oauthClient.verifyIdToken({ idToken: token });

        const payload = tokenInfo.getPayload()

        return payload
    }

    async registerUser(token: string, email: string, res,req) {
        const userData = await this.getUserData(token);
        
        const data:UserInput = { email,
                       firstName : userData.given_name,
                       lastName : userData.family_name,
                       picture : userData.picture
                    }

        const user = await this.createWithGoogle(data);

        return this.handleRegisteredUser(user, res,req);
    }

    async createWithGoogle(data:UserInput) {

        const user = await this.prisma.user.create({
            data: {
                ...data
            }
        })

        return user;
    }

    async me(id: string):Promise<User> {
        return await this.prisma.user.findUnique({
            where: { id: id },
        }).catch((err) => { throw new Error("You are not logged in") });
    }


}