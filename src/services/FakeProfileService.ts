import { fakeProfileApi } from '@/services/fakeProfileApi';
import { FakeProfileData } from '@/types/FakeProfileData';
import { UserDTO } from '@/dto/user.dto';
import * as cacheManager from 'cache-manager';

export class FakeProfileService {
	// TODO: add cache invalidation, add cache time of life - 5 mins

	private static cache = cacheManager.createCache({ ttl: 5 * 60 * 1000 });

	public static async getUserById(
		userId: string,
	): Promise<Partial<Record<keyof UserDTO, string>>> {
		const candidate = await this.cache.get(userId);
		if (candidate) {
			return candidate;
		}

		try {
			if (!userId) {
				return {};
			}

			const { data: fakeProfileData } =
				await fakeProfileApi.get<FakeProfileData>(`/v3/user/${userId}`);

			if (!fakeProfileData) {
				return {};
			}

			const res: Partial<Record<keyof UserDTO, string>> = {};

			// TODO: improve?)
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

			await this.cache.set(userId, res);

			return res;
		} catch (e) {
			return {};
		}
	}
}
