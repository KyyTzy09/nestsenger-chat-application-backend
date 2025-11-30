import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { GetSessionDto, LoginDto, RegisterDto } from "./auth.dto";
import { User } from "@prisma/client";
import { UserRepository } from "../user/user.repository";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService) { }

    async getSession(dto: GetSessionDto) {
        const existingUser = await this.userRepository.findById(dto)
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { data: existingUser }
    }

    async Register(dto: RegisterDto): Promise<{ message: string, statusCode: number, data: User }> {
        const existingUser = await this.userRepository.findByEmail({ email: dto.email })

        if (existingUser) {
            throw new HttpException("this email is already in use", HttpStatus.CONFLICT)
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)
        const createdUser = await this.userRepository.createUser({ email: dto.email, userName: dto.userName, password: hashedPassword })
        return { message: "Register successfully", statusCode: HttpStatus.CREATED, data: createdUser }
    }

    async Login(dto: LoginDto): Promise<{ token: string }> {
        const existingUser = await this.userRepository.findByEmail({ email: dto.email })

        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const comparePassword = await bcrypt.compare(dto.password, existingUser.password)
        if (!comparePassword) {
            throw new HttpException("Incorrect password", HttpStatus.BAD_REQUEST)
        }

        const payload = { userId: existingUser.userId }
        return { token: await this.jwtService.signAsync(payload) }
    }

}