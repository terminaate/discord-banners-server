import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { AvatarDecorationsService } from '@/services/AvatarDecorationsService';

export const validateProfileEffect = (val: string): boolean => {
	if (!ProfileEffectsService.getProfileEffectById(val)) {
		throw new Error("Profile effect doesn't exist");
	}
	return true;
};

export const validateDecoration = (val: string): boolean => {
	if (!AvatarDecorationsService.getDecorationByAsset(val)) {
		throw new Error("Decoration doesn't exist");
	}
	return true;
};

export const getCacheHeader = (needToCacheResponse?: boolean): string =>
	needToCacheResponse ? 'max-age=30000' : 'no-store, no-cache, must-revalidate';
