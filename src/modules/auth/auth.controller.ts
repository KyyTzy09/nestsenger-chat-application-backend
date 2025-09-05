import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";

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
    Login(@Body() dto: LoginDto) {
        return this.authService.Login(dto)
    }
}