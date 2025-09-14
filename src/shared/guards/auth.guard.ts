import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { UserRepository } from "src/modules/user/user.repository";
import { jwtSecret } from "../constants/jwt.secret";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService) { }
    private extractTokenFromHeader(req: Request): string | undefined {
        const token = req.cookies["access-token"]
        return token || undefined
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request)
        if (!token) throw new HttpException("Access token not found", HttpStatus.UNAUTHORIZED)

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtSecret
            })

            const existingUser = await this.userRepository.findById({ userId: payload.userId })
            if (!existingUser) {
                throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
            }

            request["user"] = existingUser
        } catch (error) {
            throw new UnauthorizedException()
        }
        return true
    }
}