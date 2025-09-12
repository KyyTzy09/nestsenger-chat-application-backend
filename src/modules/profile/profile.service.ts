import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { getProfileDto, UpdateAvatarDto, UpdateProfileDto } from './profile.dto';

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

    async updateProfile(dto: UpdateProfileDto) {
        const existingProfile = await this.profileRepository.getUserProfile(dto)
        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedProfile = await this.profileRepository.updateProfile(dto)
        return { message: "Profile updated successfully", data: updatedProfile }
    }

    async updateAvatar(dto: UpdateAvatarDto) {
        const existingProfile = await this.profileRepository.getUserProfile({ userId: dto.userId })

        if (!existingProfile) {
            throw new HttpException("User is not registered", HttpStatus.NOT_FOUND)
        }

        const updatedAvatar = await this.profileRepository.updateUserAvatar(dto)
        return { message: "Avatar updated successfully", data: updatedAvatar }
    }
}
