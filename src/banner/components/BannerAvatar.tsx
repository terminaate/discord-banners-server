import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { BannerColors } from '../const';

export const BannerAvatar = () => {
	const context = useContext(bannerContext);

	const x = 73;
	const y = 136;
	const height = 159;
	const width = 159;

	const radius = 79.5;

	const backgroundX = 152.5;
	const backgroundY = 215.5;
	const backgroundRadius = 94.5;

	return (
		<>
			<circle
				cx={backgroundX}
				cy={backgroundY}
				r={backgroundRadius}
				fill={BannerColors.INFO_COLOR}
			/>
			<image
				width={width}
				height={height}
				href={context.user.avatar}
				x={x}
				y={y}
				clipPath={`inset(0% round ${radius}px)`}
			/>
		</>
	);
};
