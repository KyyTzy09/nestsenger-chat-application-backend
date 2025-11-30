import { Body, Controller, Delete, Get, HttpStatus, Patch, Req, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AVATAR_FIELD_NAME, AVATAR_UPLOAD_PATH } from 'src/shared/constants/upload';
import { UpdateBioDto, UpdateUsernameDto } from './profile.dto';
import { ResponseType } from 'src/shared/types/response';
import { Profile, User } from '@prisma/client';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get("get")
    @UseGuards(AuthGuard)
    async getProfile(@Req() req): Promise<ResponseType<User>> {
        const profile = await this.profileService.getUserProfile({ userId: req.user.userId })
        return { message: "User retrieved successfull", statusCode: HttpStatus.OK, data: profile.data }
    }

    @Patch("name/patch")
    @UseGuards(AuthGuard)
    async updateUsername(@Req() req, @Body() dto: UpdateUsernameDto) {
        const updatedUsername = await this.profileService.updateUsername({ userId: req.user.userId, userName: dto.userName })
        return { message: "Username updated successfully", statusCode: HttpStatus.OK, data: updatedUsername.data }
    }

    @Patch("bio/patch")
    @UseGuards(AuthGuard)
    async updateBio(@Req() req, @Body() dto: UpdateBioDto): Promise<ResponseType<Partial<Profile>>> {
        const updatedBio = await this.profileService.updateBio({ userId: req.user.userId, bio: dto.bio })
        return { message: "Bio updated successfully", statusCode: HttpStatus.OK, data: updatedBio.data }
    }

    @Patch("avatar/patch")
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor(AVATAR_FIELD_NAME, {
        storage: diskStorage({
            destination: AVATAR_UPLOAD_PATH,
            filename(_req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            },
        })
    }))
    async updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req): Promise<ResponseType<Partial<Profile>>> {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/avatars/${file.filename}`

        const updatedAvatar = await this.profileService.updateAvatar({ userId: req.user.userId, avatar: fileUrl })
        return { message: "Avatar updated successfully", statusCode: HttpStatus.OK, data: updatedAvatar.data }
    }

    @Delete("avatar/delete")
    @UseGuards(AuthGuard)
    async deleteAvatar(@Req() req): Promise<ResponseType<Profile>> {
        const deletedAvatar = await this.profileService.deleteAvatar({ userId: req.user.userId })
        return { message: "Avatar deleted successfully", statusCode: HttpStatus.OK, data: deletedAvatar.data }
    }
}
