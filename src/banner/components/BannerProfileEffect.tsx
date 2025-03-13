import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { ProfileEffectsService } from '@/services/ProfileEffectsService';

export const BannerProfileEffect = () => {
	const {
		width,
		height,
		user: { profileEffect },
		bannerOptions,
	} = useContext(bannerContext);
	if (!profileEffect) {
		return null;
	}

	const animated = !!bannerOptions?.animated;

	const profileEffectObject =
		ProfileEffectsService.getProfileEffectById(profileEffect);
	if (!profileEffectObject) {
		return null;
	}

	const effect = profileEffectObject.config.effects[0];

	const profileEffectURL = animated
		? profileEffectObject.config.reducedMotionSrc
		: effect.src;
	const naturalWidth = effect.width;
	const naturalHeight = effect.height;

	const x = 0;
	const y = (height - naturalHeight) / 2;

	const scaleX = width / naturalWidth;

	return (
		<>
			<image
				x={0}
				y={0}
				width={naturalWidth}
				height={naturalHeight}
				href={profileEffectURL}
				transform={`matrix(${scaleX},0,0,${scaleX},${x},${y})`}
			/>
		</>
	);
};
