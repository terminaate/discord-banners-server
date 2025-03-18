import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerOptions } from '@/banner/types/banner-options';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { pickBy } from 'lodash';

type CacheKeyData = {
  overwrites?: Partial<Record<keyof UserDTO, string>>;
  bannerOptions?: BannerOptions;
};

type DataFromCacheKey = {
  userId: string;
  username: string;
  overwrites?: Partial<Record<keyof UserDTO, string>>;
  bannerOptions?: BannerOptions;
};

type GenerateCacheKeyOpts = {
  userId: string;
  username: string;
  overwrites?: Partial<Record<keyof UserDTO, string>>;
  bannerOptions?: BannerOptions;
};

type GetCacheDataOpts = {
  userId: string;
};

type SetCacheKeyOpts = {
  userId: string;
  username: string;
  overwrites?: Partial<Record<keyof UserDTO, string>>;
  bannerOptions?: BannerOptions;
};

type GetFromCacheOpts = {
  userId: string;
  bannerOptions?: BannerOptions;
  overwrites?: Partial<Record<keyof UserDTO, string>>;
};

// TODO: maybe storing kilobytes of images in redis not the best idea

@Injectable()
export class BannerCacheService {
  private readonly logger = new Logger(BannerCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async setBannerInCache(cacheKeyOpts: SetCacheKeyOpts, data: string) {
    const { userId } = cacheKeyOpts;

    const cacheKey = this.generateCacheKey(cacheKeyOpts);

    // TODO: not remove all cache keys, let's say max count of cache keys for each user  gonna be 3, so there's max 3 versions of banner, rollback date of banner and sort banners by date to  get latest banner's data to render on user changes
    const relativeCacheKeys = await this.scanCacheKeys((candidate) =>
      candidate.includes(userId),
    );

    for (const trashKey of relativeCacheKeys) {
      await this.cacheManager.del(trashKey);
    }

    await this.cacheManager.set(cacheKey, data);
  }

  public async getBannerFromCache({
    userId,
    bannerOptions = { compact: false, animated: true },
    overwrites = {},
  }: GetFromCacheOpts): Promise<string | undefined> {
    const data: CacheKeyData = pickBy(
      {
        overwrites,
        bannerOptions,
      },
      (obj) => Object.values(obj ?? {}).some((p) => p !== undefined),
    );
    const serializedData = btoa(JSON.stringify(data));

    const relatedCacheKeys = await this.scanCacheKeys((candidate) => {
      const [candidateUserId, candidateUsername, candidateData] =
        candidate.split('@');

      const isSameUser =
        userId === candidateUserId || userId === candidateUsername;
      const isSameData = candidateData === serializedData;

      return isSameUser && isSameData;
    });

    const cacheKey = relatedCacheKeys[0];
    if (!cacheKey) {
      return;
    }

    return (await this.cacheManager.get(cacheKey)) as string;
  }

  public async getCachedBannerData({ userId }: GetCacheDataOpts) {
    const relatedCacheKeys = await this.scanCacheKeys((candidate) =>
      candidate.includes(userId),
    );
    const cacheKey = relatedCacheKeys[0];
    if (!cacheKey) {
      return;
    }

    return this.getDataFromCacheKey(cacheKey);
  }

  private generateCacheKey({
    bannerOptions,
    overwrites,
    username,
    userId,
  }: GenerateCacheKeyOpts) {
    const cacheKey = `${userId}@${username}`;

    const data: CacheKeyData = pickBy(
      {
        overwrites,
        bannerOptions,
      },
      (obj) => Object.values(obj ?? {}).some((p) => p !== undefined),
    );

    return `${cacheKey}@${btoa(JSON.stringify(data))}`;
  }

  private getDataFromCacheKey(cacheKey: string): DataFromCacheKey {
    if (!cacheKey) {
      return {
        userId: '',
        username: '',
      };
    }

    const [userId, username, data] = cacheKey.split('@');

    const { overwrites, bannerOptions } = data
      ? (JSON.parse(atob(data)) as CacheKeyData)
      : {
          bannerOptions: undefined,
          overwrites: undefined,
        };

    return {
      userId,
      username,
      overwrites,
      bannerOptions,
    };
  }

  private async scanCacheKeys(filterCb: (val: string) => boolean) {
    try {
      const redisStore = this.cacheManager.stores[0];
      const matchedKeys: string[] = [];

      const iterator = redisStore.iterator!;

      for await (const [key] of iterator({})) {
        if (filterCb(key as string)) {
          matchedKeys.push(key as string);
        }
      }

      return matchedKeys;
    } catch (e) {
      this.logger.error(e);
      return [];
    }
  }
}
