import { UserDTO } from '@/common/dto/user.dto';
import { FakeProfileData } from '@/fake-profile/types/fake-profile-data';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class FakeProfileService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
  ) {}

  async getUserById(
    userId: string,
  ): Promise<Partial<Record<keyof UserDTO, string>>> {
    if (!userId) {
      return {};
    }

    const candidate = await this.cacheManager.get(userId);
    if (candidate) {
      return candidate;
    }

    try {
      const { data: fakeProfileData } =
        await this.httpService.axiosRef.get<FakeProfileData>(
          `/users?ids=${userId}`,
        );

      if (!fakeProfileData) {
        return {};
      }

      const res: Partial<Record<keyof UserDTO, string>> = {};

      if (fakeProfileData.avatar) {
        res.avatar = fakeProfileData.avatar;
      }

      if (fakeProfileData.profile_effect) {
        res.profileEffect = fakeProfileData.profile_effect;
      }

      if (fakeProfileData.banner) {
        res.banner = fakeProfileData.banner;
      }

      if (fakeProfileData.decoration) {
        res.avatarDecoration = fakeProfileData.decoration.asset;
      }

      await this.cacheManager.set(userId, res);

      return res;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return {};
    }
  }
}
