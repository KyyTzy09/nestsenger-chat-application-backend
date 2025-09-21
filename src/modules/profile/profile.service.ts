import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { DeleteAvatarDto, getProfileDto, UpdateAvatarDto, UpdateBioDto, UpdateUsernameDto } from './profile.dto';
import { defaultImage } from 'src/shared/constants/image';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository) { }

    async getUserProfile(dto: getProfileDto) {
        const existingProfile = await this.profileRepository.getUserProfile(dto)

        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        return { message: "User retrieved successfull", data: existingProfile }
    }

    async updateUsername(dto: UpdateUsernameDto) {
        const existingProfile = await this.profileRepository.getUserProfile(dto)
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedUserName = await this.profileRepository.updateUserName(dto)
        return { message: "Profile updated successfully", data: updatedUserName }
    }

    async updateBio(dto: UpdateBioDto) {
        const existingProfile = await this.profileRepository.getUserProfile(dto)
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedUserName = await this.profileRepository.updateBio(dto)
        return { message: "Profile updated successfully", data: updatedUserName }
    }

    async updateAvatar(dto: UpdateAvatarDto) {
        const existingProfile = await this.profileRepository.getUserProfile({ userId: dto.userId })

        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedAvatar = await this.profileRepository.updateUserAvatar(dto)
        return { message: "Avatar updated successfully", data: updatedAvatar }
    }

    async deleteAvatar(dto: DeleteAvatarDto) {
        const existingProfile = await this.profileRepository.getUserProfile({ userId: dto.userId })
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedAvatar = await this.profileRepository.deleteAvatar({ userId: dto.userId, avatar: defaultImage })
        return { message: "Avatar deleted successfully", data: updatedAvatar }
    }
}
