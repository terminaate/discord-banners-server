import { bannerContext } from '../BannerContext';
import { BANNER_START_CONTENT_X, BannerColors } from '../const';
import { useContext } from 'preact/compat';

export const BannerCustomStatus = () => {
	const { user } = useContext(bannerContext);
	const { customStatus } = user;
	if (typeof customStatus !== 'string') {
		return;
	}

	const x = BANNER_START_CONTENT_X;
	const y = 269;

	const maxLength = 45;

	let statusText = customStatus;

	if (statusText.length > maxLength) {
		statusText = `${statusText.slice(0, maxLength)  }...`;
	}

	return (
		<text
			fill={BannerColors.THIRD_TEXT_COLOR}
			fontSize={'18px'}
			fontFamily={'Whitney'}
			x={x}
			y={y}
		>
			{statusText}
		</text>
	);
};
