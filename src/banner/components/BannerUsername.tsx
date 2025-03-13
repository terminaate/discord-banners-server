import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { BANNER_START_CONTENT_X, BannerColors } from '../const';

export const BannerUsername = () => {
	const context = useContext(bannerContext);

	const x = BANNER_START_CONTENT_X;
	const y = 234;

	return (
		<text
			fontSize={'34px'}
			fontFamily={'ABCGintoNormal'}
			x={x}
			y={y}
			fill={BannerColors.BASE_TEXT_COLOR}
		>
			{context.user.username}
		</text>
	);
};
