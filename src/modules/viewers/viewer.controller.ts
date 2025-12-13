import { Controller, Get, HttpStatus, Req, UseGuards } from "@nestjs/common";
import { ViewerService } from "./viewer.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseType } from "src/shared/types/response";
import { StatusViewer } from "@prisma/client";

@Controller("viewer")
export class ViewerController {
    constructor(private readonly viewerService: ViewerService) { }

    @Get("today-user/get")
    @UseGuards(AuthGuard)
    async getTodayUserViewers(@Req() req): Promise<ResponseType<StatusViewer[]>> {
        const result = await this.viewerService.getTodayUserViewers({ userId: req.user.userId })
        return { message: "Viewers Retrieved Successfully", statusCode: HttpStatus.OK, data: result.data }
    }
}