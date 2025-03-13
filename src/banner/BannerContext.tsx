import React, { createContext, FC, PropsWithChildren } from 'react';
import { BannerProps } from './Banner.new';
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
};

export const bannerContext = createContext<BannerContext>({} as BannerContext);

const getDynamicHeight = ({ user, activity }: BannerProps) => {
	return BannerDynamicHeights.find((o) => o.condition(user, activity));
};

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
	};

	const dynamicHeight = getDynamicHeight(props);

	if (dynamicHeight) {
		context.heightScale = dynamicHeight.height / BANNER_DEFAULT_HEIGHT;
		context.height = dynamicHeight.height;
	}

	return (
		<bannerContext.Provider value={context}>{children}</bannerContext.Provider>
	);
};
