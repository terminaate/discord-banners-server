import { ProfileEffect } from '@/types/ProfileEffect';
import axios from 'axios';

export class ProfileEffectsService {
	private static profileEffects: Record<string, ProfileEffect> = {};
	private static readonly PROFILE_EFFECTS_ENDPOINT =
		'https://fakeprofile.is-always.online/profile-effects';

	public static getAll() {
		return this.profileEffects;
	}

	public static async init() {
		const { data: effects } = await axios.get<typeof this.profileEffects>(
			this.PROFILE_EFFECTS_ENDPOINT,
		);

		this.profileEffects = effects;

		console.log('Profile effects retrieved');
	}

	public static getProfileEffectById(id: string) {
		return this.profileEffects[id];
	}

	public static getProfileEffectUrlById(id: string): string | undefined {
		const profileEffect = this.profileEffects[id];
		if (!profileEffect) {
			return;
		}

		return profileEffect.config.effects[0].src;
	}
}
