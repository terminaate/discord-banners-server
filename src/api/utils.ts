import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { AvatarDecorationsService } from '@/services/AvatarDecorationsService';
import { UserDTO } from '@/dto/user.dto';

export function validateProfileEffect(val: string): boolean {
	if (!ProfileEffectsService.getProfileEffectById(val)) {
		throw new Error("Profile effect doesn't exist");
	}
	return true;
}

export function validateDecoration(val: string): boolean {
	if (!AvatarDecorationsService.getDecorationByAsset(val)) {
		throw new Error("Decoration doesn't exist");
	}
	return true;
}

export function getCacheHeader(needToCacheResponse?: boolean): string {
	return needToCacheResponse
		? 'max-age=30000'
		: 'no-store, no-cache, must-revalidate';
}

export function getOverwrites(
	profileEffect?: string,
	decoration?: string,
): Partial<Record<keyof UserDTO, string>> {
	return {
		profileEffect: profileEffect
			? ProfileEffectsService.getProfileEffectAnimatedImageById(profileEffect)
			: undefined,
		avatarDecoration: decoration
			? AvatarDecorationsService.getDecorationUrl(decoration)
			: undefined,
	};
}
