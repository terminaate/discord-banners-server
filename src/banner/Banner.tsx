import React, { FC, PropsWithChildren, useContext } from 'react';
import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { BannerOptions } from '@/types/BannerOptions';
import { bannerContext, BannerContextProvider } from '@/banner/BannerContext';
import { BannerBackground } from '@/banner/components/BannerBackground';
import { BannerAvatar } from '@/banner/components/BannerAvatar';
import { BannerStatus } from '@/banner/components/BannerStatus';
import { BannerUsername } from '@/banner/components/BannerUsername';
import { BannerPublicFlags } from '@/banner/components/BannerPublicFlags';
import { BannerNitro } from '@/banner/components/BannerNitro';
import { BannerActivity } from '@/banner/components/BannerActivity';
import { BannerCustomStatus } from '@/banner/components/BannerCustomStatus';
import { BannerSeparator } from '@/banner/components/BannerSeparator';

export type BannerProps = {
	user: UserDTO;
	activity?: UserActivityDTO;
	bannerOptions?: BannerOptions;
};

const BannerRoot: FC<PropsWithChildren> = ({ children }) => {
	const context = useContext(bannerContext);

	return (
		<svg
			width={context.width}
			height={context.height}
			viewBox={`0 0 ${context.width} ${context.height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={{ borderRadius: context.borderRadius }}
		>
			{children}
		</svg>
	);
};

const globalStyle = `
@font-face {
	font-family: 'ABCGintoNormal';
	src: url(/fonts/ABCGintoNormal.otf);
}

@font-face {
	font-family: 'Whitney';
	src: url(/fonts/Whitney.otf);
}
`;

export const Banner: FC<BannerProps> = (props) => {
	return (
		<BannerContextProvider {...props}>
			<BannerRoot>
				<style>{globalStyle}</style>

				<BannerBackground />
				<BannerAvatar />
				<BannerStatus />
				<BannerUsername />
				<BannerPublicFlags />
				<BannerNitro />
				<BannerActivity />
				<BannerCustomStatus />
				<BannerSeparator />
			</BannerRoot>
		</BannerContextProvider>
	);
};
