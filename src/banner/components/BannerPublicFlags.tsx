import { bannerContext } from '../BannerContext';
import { PublicFlagsImages } from '../const';
import { useContext } from 'preact/compat';

export const BannerPublicFlags = () => {
	const context = useContext(bannerContext);

	const x = context.width - 60;
	const y = 212;

	const width = 24;
	const height = 24;

	const { publicFlags } = context.user;
	if (!publicFlags || !PublicFlagsImages[publicFlags]) {
		return null;
	}

	const hypesquadImage = PublicFlagsImages[publicFlags];

	return (
		<image x={x} y={y} width={width} height={height} href={hypesquadImage} />
	);
};
