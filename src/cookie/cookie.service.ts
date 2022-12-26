import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/user.model';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CookieService {
  constructor(private readonly prisma:PrismaService){}
  
  async createAccessToken(userId:string, type:string){
  return jwt.sign(
    { userId , type },
    process.env.ACCESS_TOKEN,
    { expiresIn: '7d' },
  );
};

 async createRefreshToken (userId:string, tokenVersion:number) {
  return jwt.sign(
    { userId, tokenVersion},
    process.env.REFRESH_TOKEN,
    { expiresIn: '7d' },
  );
};

 async sendRefereshToken  (res, token) {
    return res.cookie('ourapp', token, {
      httpOnly: true,
      maxAge: 604800000,
      path: '/refresh',
      sameSite: 'lax',
    });
  
};

    async setCookieForUnLoggedUsers(res, token){
            return res.cookie('guestId', token, {
                httpOnly: true,
                maxAge: 259200000, // 3 days (ms)
                path: '/',
                sameSite: 'lax',
            });

    }

    async getUser(id: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: { id: id },
        }).catch((err) => { throw new Error("User not found") });
    }
}
