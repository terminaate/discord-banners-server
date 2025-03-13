import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { BannerColors } from '../const';

export const BannerBackground = () => {
	const context = useContext(bannerContext);

	const height = 185;

	const userBannerUrl = context.user.banner;
	const userAccentColor = context.user.accentColor;

	return (
		<>
			<rect width={'100%'} height={'100%'} fill={BannerColors.INFO_COLOR} />
			{userBannerUrl ? (
				<image
					href={userBannerUrl}
					height={height}
					width={'100%'}
					x={0}
					y={0}
					preserveAspectRatio={'xMidYMid slice'}
				/>
			) : (
				<rect width={'100%'} height={height} fill={userAccentColor} />
			)}
		</>
	);
};
