import { BorderRadius, BorderRadiusObject } from '@/types/BorderRadius';

export const getBorderRadiusObject = (
	radius: BorderRadius,
): Required<BorderRadiusObject> => {
	let radiusObject = { tl: 0, tr: 0, br: 0, bl: 0 };

	if (typeof radius === 'number') {
		radiusObject = { tl: radius, tr: radius, br: radius, bl: radius };
	} else {
		for (const side in radiusObject) {
			radiusObject[side] = radius[side] || 0;
		}
	}

	return radiusObject;
};
