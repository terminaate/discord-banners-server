import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { BannerColors, StatusColors } from '../const';

export const BannerStatus = () => {
	const context = useContext(bannerContext);

	const x = 206.5;
	const y = 270.5;

	const backgroundRadius = 27.5;
	const radius = 17.5;

	const userStatus = context.user.status;

	return (
		<>
			<circle
				cx={x}
				cy={y}
				r={backgroundRadius}
				fill={BannerColors.INFO_COLOR}
			/>
			{userStatus && (
				<circle cx={x} cy={y} r={radius} fill={StatusColors[userStatus]} />
			)}
		</>
	);
};
