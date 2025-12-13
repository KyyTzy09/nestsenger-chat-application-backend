import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ViewerRepository } from "./viewer.repository";
import { StatusRepository } from "../status/status.repository";
import { getTodayUserViewersDto, getViewerByStatusIdDto, updateStatusViewDto } from "./viewer.dto";
import { UserRepository } from "../user/user.repository";

@Injectable()
export class ViewerService {
    constructor(private readonly viewerRepository: ViewerRepository, private readonly statusRepository: StatusRepository, private readonly userRepository: UserRepository) { }

    async getViewerByStatusId(dto: getViewerByStatusIdDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const existingStatus = await this.statusRepository.findById({ statusId: dto.statusId })
        if (!existingStatus) throw new NotFoundException("Status Not Found")

        if (existingStatus.creatorId !== dto.userId) throw new BadRequestException("You Don't Have Access To This Feature")


        const viewers = await this.viewerRepository.findByStatusId({ statusId: dto.statusId })
        if (viewers.length === 0) throw new NotFoundException("Viewer Not Founds")

        return { data: viewers }
    }

    async getTodayUserViewers(dto: getTodayUserViewersDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const viewers = await this.viewerRepository.findTodayUserViewers({ userId: dto.userId, now: new Date() })
        if (viewers.length === 0) throw new NotFoundException("Viewer Data Not Founds")
        return { data: viewers }
    }

    async updateViewStatus(dto: updateStatusViewDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const existingViewer = await this.viewerRepository.findByUnique({ viewerId: dto.viewerId, statusId: dto.statusId })
        if (!existingViewer) throw new NotFoundException("Viewer Not Found")
        else if (existingViewer.isViewed === true) return null

        const updatedViewer = await this.viewerRepository.updateView({ viewerId: dto.viewerId, statusId: dto.statusId })
        return { data: updatedViewer }
    }
}