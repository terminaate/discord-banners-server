import { bannerContext } from '../BannerContext';
import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { useContext } from 'preact/compat';

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
	const compact = !!bannerOptions?.compact;

	const profileEffectObject =
		ProfileEffectsService.getProfileEffectById(profileEffect);
	if (!profileEffectObject) {
		return null;
	}

	const effect = profileEffectObject.config.effects[0];

	const profileEffectURL = animated
		? effect.src
		: profileEffectObject.config.reducedMotionSrc;
	const naturalWidth = effect.width;
	const naturalHeight = effect.height;

	const x = 0;
	const y = compact ? 0 : (height - naturalHeight) / 2;

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
