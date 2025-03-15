import { ActivityType, PresenceStatus } from 'discord.js';
import * as path from 'path';
import { BannerDynamicHeight } from '@/banner/types/banner-dynamic-height';

export const StatusColors: Record<PresenceStatus, string> = {
  online: '#3BA55D',
  idle: '#faa81a',
  dnd: '#ed4245',
  offline: '#747f8d',
  invisible: '#747f8d',
};

export const AssetsPath = path.resolve(__dirname, '../../assets/');

export const PublicFlagsImages: Record<number, string> = {
  64: path.resolve(AssetsPath, 'icons/HypeSquad_Bravery.svg'),
  128: path.resolve(AssetsPath, 'icons/HypeSquad_Brilliance.svg'),
  256: path.resolve(AssetsPath, 'icons/HypeSquad_Balance.svg'),
};

export const ActivitiesText: Partial<Record<ActivityType, string>> = {
  [ActivityType.Playing]: 'PLAYING A GAME',
  [ActivityType.Streaming]: 'STREAMING',
  [ActivityType.Listening]: 'LISTENING',
  [ActivityType.Watching]: 'WATCHING',
};

export const BannerColors = {
  DEFAULT_ACCENT_COLOR: '#fff',
  INFO_COLOR: '#18191C',
  BASE_TEXT_COLOR: '#fff',
  SECOND_TEXT_COLOR: '#B9BBBE',
  THIRD_TEXT_COLOR: '#B2B2B4',
};

export const BANNER_DEFAULT_WIDTH = 961;
export const BANNER_COMPACT_WIDTH = 600;
export const BANNER_DEFAULT_HEIGHT = 466;
export const BANNER_START_CONTENT_X = 262;

export const BannerDynamicHeights: BannerDynamicHeight[] = [
  {
    condition(user, activity) {
      const { customStatus } = user;
      return !!customStatus && !activity;
    },
    height: 330,
  },
  {
    condition(user, activity) {
      const { customStatus } = user;
      return !customStatus && !activity;
    },
    height: 320,
  },
  {
    condition(user, activity) {
      const { customStatus } = user;
      return !customStatus && !!activity;
    },
    height: 421,
    separator: true,
  },
];
