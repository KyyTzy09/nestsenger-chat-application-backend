import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { Response } from "express";
import { User } from "@prisma/client";
import { ResponseType } from "src/shared/types/response";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Get("session")
    @UseGuards(AuthGuard)
    async GetSession(@Req() req): Promise<ResponseType<User>> {
        const session = await this.authService.getSession({ userId: req.user.userId })
        return { message: "Getting user session successfully", statusCode: HttpStatus.OK, data: session.data }
    }

    @Post("register")
    async Register(@Body() dto: RegisterDto): Promise<ResponseType<User>> {
        const result = await this.authService.Register(dto)
        return { message: "Register successfully", statusCode: HttpStatus.CREATED, data: result.data }
    }

    @Post("login")
    async Login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<{ message: string, statusCode: number }> {
        const { token } = await this.authService.Login(dto)
        res.cookie("access-token", token, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        })

        return { message: "Login successfull", statusCode: HttpStatus.OK, }
    }

    @Post("logout")
    Logout(@Res({ passthrough: true }) res: Response): { message: string, statusCode: number } {
        res.clearCookie("access-token")
        return { message: "Logout Successfully", statusCode: HttpStatus.OK }
    }
}