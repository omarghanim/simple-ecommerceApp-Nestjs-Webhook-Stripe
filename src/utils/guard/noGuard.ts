import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class NoGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context).getContext();
      
        if (!ctx.headers.authorization) {
               ctx.user=null
               return true ;
        }      

        ctx.user = await this.validateToken(ctx.headers.authorization);
        return true;

    }

    async validateToken(auth: string) {
        if (auth.split(' ')[0] !== 'Bearer') {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        const token = auth.split(' ')[1];
            
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

            return decoded

        } catch (err) {
            let message = 'Token error: ' + (err.message || err.name);
            if (err.message == "jwt expired") {
                message = 'token expired'
                throw new HttpException(message, HttpStatus.UNAUTHORIZED);
            }
            throw new HttpException(message, HttpStatus.UNAUTHORIZED);
        }
    }
}
