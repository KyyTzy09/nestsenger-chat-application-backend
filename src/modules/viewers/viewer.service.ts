import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ViewerRepository } from "./viewer.repository";
import { StatusRepository } from "../status/status.repository";
import { getTodayUserViewersDto } from "./viewer.dto";
import { UserRepository } from "../user/user.repository";

@Injectable()
export class ViewerService {
    constructor(private readonly viewerRepository: ViewerRepository, private readonly statusRepository: StatusRepository, private readonly userRepository: UserRepository) { }

    async getTodayUserViewers(dto: getTodayUserViewersDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const viewers = await this.viewerRepository.findTodayUserViewers({ userId: dto.userId, now: new Date() })
        if (viewers.length === 0) throw new NotFoundException("Viewer Data Not Founds")
        return { data: viewers }
    }
}