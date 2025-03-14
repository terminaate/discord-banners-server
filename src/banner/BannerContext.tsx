import { BannerProps } from './Banner';
import {
	BANNER_COMPACT_WIDTH,
	BANNER_DEFAULT_HEIGHT,
	BANNER_DEFAULT_WIDTH,
	BannerDynamicHeights,
} from './const';
import { createContext, FC, PropsWithChildren } from 'preact/compat';

type BannerContext = BannerProps & {
	heightScale: number;
	height: number;
	width: number;
	borderRadius: number;
	separator: boolean;
};

export const bannerContext = createContext<BannerContext>({} as BannerContext);

export const BannerContextProvider: FC<PropsWithChildren<BannerProps>> = ({
	children,
	...props
}) => {
	const context: BannerContext = {
		...props,
		heightScale: 1,
		height: BANNER_DEFAULT_HEIGHT,
		width: BANNER_DEFAULT_WIDTH,
		borderRadius: 14,
		separator: true,
	};

	const dynamicHeight = BannerDynamicHeights.find((o) =>
		o.condition(props.user, props.activity),
	);

	if (dynamicHeight) {
		context.heightScale = dynamicHeight.height / BANNER_DEFAULT_HEIGHT;
		context.height = dynamicHeight.height;
		context.separator = !!dynamicHeight.separator;
	}

	if (context.bannerOptions?.compact) {
		context.width = BANNER_COMPACT_WIDTH;
	}

	return (
		<bannerContext.Provider value={context}>{children}</bannerContext.Provider>
	);
};
