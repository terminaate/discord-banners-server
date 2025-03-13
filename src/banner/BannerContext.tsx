import React, { createContext, FC, PropsWithChildren } from 'react';
import { BannerProps } from './Banner';
import {
	BANNER_DEFAULT_HEIGHT,
	BANNER_DEFAULT_WIDTH,
	BannerDynamicHeights,
} from './const';

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
		console.log('dynamicHeight.separator', dynamicHeight.separator);
		context.separator = !!dynamicHeight.separator;
	}

	return (
		<bannerContext.Provider value={context}>{children}</bannerContext.Provider>
	);
};
