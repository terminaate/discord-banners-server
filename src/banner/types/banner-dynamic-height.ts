import { UserDTO } from '@/common/dto/user.dto';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';

export type BannerDynamicHeight = {
  condition: (user: UserDTO, userActivity?: UserActivityDTO) => boolean;
  height: number;
  separator?: boolean;
};
