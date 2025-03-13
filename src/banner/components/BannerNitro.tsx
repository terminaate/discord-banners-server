import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';

export const BannerNitro = () => {
	const context = useContext(bannerContext);

	const width = 34;
	const height = 24;

	const x = context.width - 104;
	const y = 212;

	const { premiumSince } = context.user;

	if (!premiumSince) {
		return null;
	}

	return (
		<image
			x={x}
			y={y}
			width={width}
			height={height}
			href={'/icons/nitro.svg'}
		/>
	);
};
