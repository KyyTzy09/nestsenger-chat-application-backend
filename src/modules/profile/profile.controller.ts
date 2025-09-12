import { Body, Controller, Get, Patch, Req, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AVATAR_FIELD_NAME, AVATAR_UPLOAD_PATH } from 'src/shared/constants/upload';
import { UpdateProfileDto } from './profile.dto';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get("get")
    @UseGuards(AuthGuard)
    getProfile(@Req() req) {
        return this.profileService.getUserProfile({ userId: req.user.userId })
    }

    @Patch("info/patch")
    @UseGuards(AuthGuard)
    updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
        return this.profileService.updateProfile({ userId: req.user.userId, userName: dto.userName, bio: dto.bio })
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
    updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/avatars/${file.filename}`

        return this.profileService.updateAvatar({ userId: req.user.userId, avatar: fileUrl })
    }
}
