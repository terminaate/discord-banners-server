import { ProfileEffect } from '@/types/ProfileEffect';
import { fakeProfileApi } from '@/services/fakeProfileApi';

export class ProfileEffectsService {
	private static profileEffects: Record<string, ProfileEffect> = {};

	public static getAll() {
		return this.profileEffects;
	}

	public static async init() {
		const { data: effects } =
			await fakeProfileApi.get<typeof this.profileEffects>('/profile-effects');

		this.profileEffects = effects;

		console.log('Profile effects retrieved');
	}

	public static getProfileEffectById(id: string) {
		return this.profileEffects[id];
	}
}
