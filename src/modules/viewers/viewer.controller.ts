import { Body, Controller, Get, HttpStatus, Patch, Req, UseGuards } from "@nestjs/common";
import { ViewerService } from "./viewer.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseType } from "src/shared/types/response";
import { StatusViewer } from "@prisma/client";
import { updateStatusViewDto } from "./viewer.dto";

@Controller("viewer")
export class ViewerController {
    constructor(private readonly viewerService: ViewerService) { }

    @Get("today-user/get")
    @UseGuards(AuthGuard)
    async getTodayUserViewers(@Req() req): Promise<ResponseType<StatusViewer[]>> {
        const result = await this.viewerService.getTodayUserViewers({ userId: req.user.userId })
        return { message: "Viewers Retrieved Successfully", statusCode: HttpStatus.OK, data: result.data }
    }

    @Patch("update/patch")
    @UseGuards(AuthGuard)
    async updateStatusView(@Req() req, @Body() dto: updateStatusViewDto): Promise<ResponseType<StatusViewer | null>> {
        const result = await this.viewerService.updateViewStatus({ userId: req.user.userId, statusId: dto.statusId, viewerId: dto.viewerId })
        return { message: "Status Updated Successfully", statusCode: HttpStatus.OK, data: result?.data ? result.data : null }
    }
}