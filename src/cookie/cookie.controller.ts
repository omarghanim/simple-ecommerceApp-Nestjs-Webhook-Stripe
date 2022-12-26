import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { generate } from 'shortid';
import { CookieService } from './cookie.service';

const { verify } = jwt;

@Controller()
export class CookieController {
    constructor(private readonly cookieService:CookieService){}

    @Post('refresh')
    async refreshUser(
        @Req() req: Request,
        @Res() res: Response,
    ) {        
        let token = await req.cookies.ourapp; 

        if (!token) {
            const cookieData = await req.cookies.guestId //check if user who not logged in has a cookie or not

        if (!cookieData) {
                const id = generate()

                await this.cookieService.setCookieForUnLoggedUsers(res, id)
                return res.json({ ok: true, id })
            }
            return res.json({ ok: true, cookieData });
        }
        let payload = null;
        let user = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN);
        } catch (err) {
            return res.json({ ok: false, accessToken: '' });
        }
        try {
            user = await this.cookieService.getUser(payload.userId);
            // check token version
            if (user.tokenVersion !== payload.tokenVersion) {
                return res.json({ ok: false, accessToken: '' });
            }
        } catch (err) {
            return res.json({ ok: false, accessToken: '' });
        }

        const accessToken = await this.cookieService.createAccessToken(user.id, user.type);
        const refreshToken = await this.cookieService.createRefreshToken(user.id, user.tokenVersion);

        await this.cookieService.sendRefereshToken(res, refreshToken);
        
        return res.json({ ok: 'true', accessToken, refreshToken });
    }

}
