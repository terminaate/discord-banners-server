import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';

export type BannerDynamicHeight = {
	condition: (user: UserDTO, userActivity?: UserActivityDTO) => boolean;
	height: number;
	separator?: boolean;
};
