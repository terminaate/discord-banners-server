import { ActivityType, PresenceStatus, UserFlags } from 'discord.js';
import * as path from 'path';
import { BannerDynamicHeight } from '@/banner/types/banner-dynamic-height';
import { MeasurementUnit } from '@/banner/lib/base-canvas';
import ms from 'ms';

export const StatusColors: Record<PresenceStatus, string> = {
  online: '#3BA55D',
  idle: '#faa81a',
  dnd: '#ed4245',
  offline: '#747f8d',
  invisible: '#747f8d',
};

export const AssetsPath = path.resolve(__dirname, '../../assets/');

const SupportedFlagsImages: (keyof typeof UserFlags)[] = [
  'HypeSquadOnlineHouse1',
  'HypeSquadOnlineHouse2',
  'HypeSquadOnlineHouse3',
  'ActiveDeveloper',
  'BugHunterLevel1',
  'BugHunterLevel2',
  'Partner',
  'Staff',
];

export const FlagsImages: Partial<Record<keyof typeof UserFlags, string>> =
  SupportedFlagsImages.reduce((acc, curr) => {
    acc[curr] = path.resolve(AssetsPath, `icons/flags/${curr}.svg`);

    return acc;
  }, {});

export const ActivitiesText: Partial<Record<ActivityType, string>> = {
  [ActivityType.Playing]: 'PLAYING A GAME',
  [ActivityType.Streaming]: 'STREAMING',
  [ActivityType.Listening]: 'LISTENING',
  [ActivityType.Watching]: 'WATCHING',
};

export const BannerColors = {
  DEFAULT_ACCENT_COLOR: '#fff',
  INFO_BACKGROUND_COLOR: '#18191C',
  SECONDARY_BACKGROUND_COLOR: '#222',
  BASE_TEXT_COLOR: '#fff',
  SECOND_TEXT_COLOR: '#B9BBBE',
  THIRD_TEXT_COLOR: '#B2B2B4',
};

export const BANNER_DEFAULT_WIDTH = 300;
export const BANNER_COMPACT_WIDTH = 600;
export const BANNER_DEFAULT_HEIGHT = 516;
export const BANNER_START_CONTENT_X: MeasurementUnit = '5%';

export const BANNER_USER_IMAGES_CACHE_TTL = ms('2m');

export const BannerDynamicHeights: BannerDynamicHeight[] = [
  {
    condition(user, activities) {
      const { customStatus } = user;
      return !!customStatus && !activities.length;
    },
    height: 250,
  },
  {
    condition(user, activities) {
      const { customStatus } = user;
      return !customStatus && !activities.length;
    },
    height: 250,
  },
  {
    condition(user, activities) {
      const { customStatus } = user;

      return !customStatus && !!activities.length && activities.length <= 1;
    },
    height: 330,
  },
  {
    condition(user, activities) {
      const { customStatus } = user;

      return !customStatus && !!activities.length && activities.length >= 1;
    },
    height: 420,
  },
];
