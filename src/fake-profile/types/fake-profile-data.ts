import { AvatarDecoration } from '@/fake-profile/types/avatar-decoration';

export type FakeProfileData = {
  decoration?: AvatarDecoration;
  profile_effect?: string;
  banner?: string | null;
  avatar?: string | null;
};
