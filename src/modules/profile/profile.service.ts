import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { DeleteAvatarDto, getProfileDto, UpdateAvatarDto, UpdateBioDto, UpdateUsernameDto } from './profile.dto';
import { defaultImage } from 'src/shared/constants/image';
import { Profile, User } from '@prisma/client';
import { ResponseType } from 'src/shared/types/response';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository) { }

    async getUserProfile(dto: getProfileDto): Promise<ResponseType<User>> {
        const existingProfile = await this.profileRepository.getUserProfile(dto)

        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        return { message: "User retrieved successfull", statusCode: HttpStatus.OK, data: existingProfile }
    }

    async updateUsername(dto: UpdateUsernameDto): Promise<ResponseType<Partial<Profile>>> {
        const existingProfile = await this.profileRepository.getUserProfile(dto)
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedUserName = await this.profileRepository.updateUserName(dto)
        return { message: "Profile updated successfully", statusCode: HttpStatus.OK, data: updatedUserName }
    }

    async updateBio(dto: UpdateBioDto): Promise<ResponseType<Partial<Profile>>> {
        const existingProfile = await this.profileRepository.getUserProfile(dto)
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedUserName = await this.profileRepository.updateBio(dto)
        return { message: "Profile updated successfully", statusCode: HttpStatus.OK, data: updatedUserName }
    }

    async updateAvatar(dto: UpdateAvatarDto): Promise<ResponseType<Partial<Profile>>> {
        const existingProfile = await this.profileRepository.getUserProfile({ userId: dto.userId })

        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedAvatar = await this.profileRepository.updateUserAvatar(dto)
        return { message: "Avatar updated successfully", statusCode: HttpStatus.OK, data: updatedAvatar }
    }

    async deleteAvatar(dto: DeleteAvatarDto): Promise<ResponseType<Profile>> {
        const existingProfile = await this.profileRepository.getUserProfile({ userId: dto.userId })
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedAvatar = await this.profileRepository.deleteAvatar({ userId: dto.userId, avatar: defaultImage })
        return { message: "Avatar deleted successfully", statusCode: HttpStatus.OK, data: updatedAvatar }
    }
}
