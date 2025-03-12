import { UserDTO } from '@/dto/user.dto';
import { BannerParams } from '@/types/BannerParams';

export type CacheKeyData = {
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerParams?: BannerParams;
};
