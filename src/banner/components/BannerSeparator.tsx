import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { BANNER_START_CONTENT_X } from '../const';

export const BannerSeparator = () => {
	const { separator, heightScale } = useContext(bannerContext);
	if (!separator) {
		return null;
	}

	const x = BANNER_START_CONTENT_X;
	const y = 310 * heightScale;
	const height = 1;
	const width = 663;

	return (
		<rect
			height={height}
			width={width}
			x={x}
			y={y}
			fill={'rgba(255, 255, 255, 0.1)'}
		/>
	);
};
