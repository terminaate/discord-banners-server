import React, { FC, PropsWithChildren, useContext } from 'react';
import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { BannerOptions } from '@/types/BannerOptions';
import { bannerContext, BannerContextProvider } from '@/banner/BannerContext';
import { BannerColors } from '@/banner/const';

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

const BannerBackground = () => {
	const context = useContext(bannerContext);

	const userBackgroundHeight = 185;

	return (
		<>
			<rect width={'100%'} height={'100%'} fill={BannerColors.INFO_COLOR} />
			<rect
				width={'100%'}
				height={userBackgroundHeight}
				x={0}
				y={0}
				style={{
					backgroundImage: `url(https://cdn.discordapp.com/banners/766183015159431188/a_496108c84af36783846616402a0d2348.gif?size=4096)`,
				}}
			/>
			{/*<de></de>*/}
			{/*<rect*/}
			{/*	width={'100%'}*/}
			{/*	height={BANNER_INFO_BACKGROUND_HEIGHT}*/}
			{/*	fill={context.user.accentColor}*/}
			{/*/>*/}
		</>
	);
};

export const BannerNew: FC<BannerProps> = (props) => {
	return (
		<BannerContextProvider {...props}>
			<BannerRoot>
				<BannerBackground />
			</BannerRoot>
		</BannerContextProvider>
	);
};
