import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { AvatarDecorationsService } from '@/services/AvatarDecorationsService';
import { Response } from 'express';
import { getMemberById } from '@/bot/getMemberById';
import { UserDTO } from '@/dto/user.dto';
import { updateBanner } from '@/banner/updateBanner';
import { redisClient } from '@/redis';

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
): Partial<Record<'profileEffect' | 'avatarDecoration', string>> {
	return {
		profileEffect: profileEffect
			? ProfileEffectsService.getProfileEffectAnimatedImageById(profileEffect)
			: undefined,
		avatarDecoration: decoration
			? AvatarDecorationsService.getDecorationUrl(decoration)
			: undefined,
	};
}

export async function handleBannerWithOverwrites(
	memberId: string,
	overwrites: Partial<Record<'profileEffect' | 'avatarDecoration', string>>,
	cacheHeader: string,
	res: Response,
) {
	const candidate = await getMemberById(memberId);
	if (!candidate) {
		return res.status(404).send('User not found');
	}

	const userDto = await UserDTO.create(candidate);
	Object.assign(userDto, overwrites);

	const svg = await updateBanner(userDto, candidate.presence?.activities);
	sendSvgResponse(res, svg, cacheHeader);
}

// TODO: maybe rename this?
export async function handleCachedOrDefaultBanner(
	memberId: string,
	cacheHeader: string,
	res: Response,
) {
	const cachedWidget = await redisClient.get(memberId);
	if (cachedWidget) {
		return sendSvgResponse(res, cachedWidget, cacheHeader);
	}

	const candidate = await getMemberById(memberId);
	if (!candidate) {
		return res.status(404).send('User not found');
	}

	const svg = await updateBanner(candidate, candidate.presence?.activities);
	sendSvgResponse(res, svg, cacheHeader);
}

function sendSvgResponse(res: Response, svg: string, cacheHeader: string) {
	res.setHeader('Content-Type', 'image/svg+xml');
	res.setHeader('Cache-Control', cacheHeader);
	res.status(200).send(svg);
}
