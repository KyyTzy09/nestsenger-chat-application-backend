import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";


@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post("register")
    Register(@Body() dto: RegisterDto) {
        return this.authService.Register(dto)
    }

    @Post("login")
    Login(@Body() dto: LoginDto) {
        return this.authService.Login(dto)
    }
}