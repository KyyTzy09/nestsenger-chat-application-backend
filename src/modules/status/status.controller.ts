import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { StatusService } from "./status.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { API_BASE_URL, STATUS_FIELD_NAME, STATuS_UPLOAD_PATH } from "src/shared/constants/upload";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { createStatusDto } from "./status.dto";
import { ResponseType } from "src/shared/types/response";
import { Status } from "@prisma/client";

@Controller("status")
export class StatusController {
    constructor(private readonly statusService: StatusService) { }

    @Post("create/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor(STATUS_FIELD_NAME, {
        storage: diskStorage({
            destination: STATuS_UPLOAD_PATH,
            filename(_req, file, cb) {
                const uniqueSuffix = "status-media" + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    async createNewStatus(@UploadedFile() file: Express.Multer.File, @Req() req, @Body() dto: createStatusDto): Promise<ResponseType<Status>> {
        const baseUrl = API_BASE_URL(req)
        const fileUrl = `${baseUrl}/uploads/status/${file.filename}`;

        const result = await this.statusService.createNewStatus({ userId: req.user.userId, fileName: file.filename, fileUrl, message: dto.message })
        return { message: "Status Created Successfully", statusCode: HttpStatus.CREATED, data: result.data }
    }

    @Get("today/get")
    @UseGuards(AuthGuard)
    async getTodayStatus(@Req() req): Promise<ResponseType<any>> {
        const result = await this.statusService.getTodayStatus({ userId: req.user.userId })
        return { message: "Today Status Data Retrieved Successfully", statusCode: HttpStatus.OK, data: result.data }
    }
}