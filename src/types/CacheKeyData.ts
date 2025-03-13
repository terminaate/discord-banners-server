import { UserDTO } from '@/dto/user.dto';
import { BannerOptions } from '@/types/BannerOptions';

export type CacheKeyData = {
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerParams?: BannerOptions;
};
