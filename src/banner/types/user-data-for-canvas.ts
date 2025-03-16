import { UserDTO } from '@/common/dto/user.dto';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';

export type UserDataForCanvas = {
  user: UserDTO;
  activities: UserActivityDTO[];
};
