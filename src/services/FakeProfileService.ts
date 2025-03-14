import { fakeProfileApi } from '@/services/fakeProfileApi';
import { FakeProfileData } from '@/types/FakeProfileData';
import { UserDTO } from '@/dto/user.dto';

export class FakeProfileService {
	private static cache = new Map<
		string,
		Partial<Record<keyof UserDTO, string>>
	>();

	public static async getUserById(
		userId: string,
	): Promise<Partial<Record<keyof UserDTO, string>>> {
		if (this.cache.has(userId)) {
			return this.cache.get(userId)!;
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

			this.cache.set(userId, res);

			return res;
		} catch (e) {
			return {};
		}
	}
}
