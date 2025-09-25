import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { Response } from "express";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Get("session")
    @UseGuards(AuthGuard)
    GetSession(@Req() req) {
        return this.authService.getSession({ userId: req.user.userId })
    }

    @Post("register")
    Register(@Body() dto: RegisterDto) {
        return this.authService.Register(dto)
    }

    @Post("login")
    async Login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { token } = await this.authService.Login(dto)
        res.cookie("access-token", token, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        })

        return { message: "Login successfull", statusCode: HttpStatus.OK }
    }

    @Post("logout")
    Logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("access-token")
        return { message: "Logout Successfully", statusode: HttpStatus.OK }
    }
}