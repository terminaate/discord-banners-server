import React, { useContext } from 'react';
import { bannerContext } from '../BannerContext';
import { ActivitiesText, BANNER_START_CONTENT_X, BannerColors } from '../const';

const x = BANNER_START_CONTENT_X;
const y = 371;

const ActivityType = () => {
	const { activity, heightScale } = useContext(bannerContext);

	if (!activity) {
		return null;
	}

	const activityType = ActivitiesText[activity.type];

	const localX = x;
	const localY = y * heightScale;

	return (
		<text
			fontSize={'18px'}
			fontFamily={'ABCGintoNormal'}
			x={localX}
			y={localY}
			fill={BannerColors.SECOND_TEXT_COLOR}
		>
			{activityType}
		</text>
	);
};

const ActivityImage = () => {
	const { activity, heightScale } = useContext(bannerContext);

	if (!activity) {
		return null;
	}

	const defaultActivityImage = '/icons/activity.svg';
	const activityImageURL = activity.largeImageURL ?? defaultActivityImage;

	const width = 42;
	const height = 42;

	const localX = x;
	const localY = (y + 13) * heightScale;

	return (
		<image
			href={activityImageURL}
			width={width}
			height={height}
			x={localX}
			y={localY}
		/>
	);
};

const ActivityName = () => {
	const { activity, heightScale } = useContext(bannerContext);

	if (!activity) {
		return null;
	}

	const localX = 312;
	const localY = 402 * heightScale;

	return (
		<text
			fill={BannerColors.THIRD_TEXT_COLOR}
			fontSize={'18px'}
			fontFamily={'ABCGintoNormal'}
			fontStyle={'normal'}
			fontWeight={'500'}
			x={localX}
			y={localY}
		>
			{activity.name}
		</text>
	);
};

const ActivityStartTime = () => {
	const { activity, heightScale } = useContext(bannerContext);

	if (!activity) {
		return null;
	}

	const activityStartTime = activity.start;
	const activityType = activity.type;
	if (!activityStartTime) {
		return;
	}

	const startTimestamp = +activityStartTime;

	const currentTime = +new Date();
	const differenceInMin = (currentTime - startTimestamp) / 100_000;
	const differenceInHour = (currentTime - startTimestamp) / 100_000 / 60;
	let timeText: string =
		'Just started ' + ActivitiesText[activityType].toLowerCase();

	if (differenceInMin >= 1) {
		timeText = `for ${Math.ceil(differenceInMin)} minutes`;
	}

	if (differenceInHour >= 1) {
		timeText = `for ${Math.ceil(differenceInHour)} hours`;
	}

	const localX = 312;
	const localY = 422 * heightScale;

	return (
		<text
			fontFamily={'Whitney'}
			fontSize={'18px'}
			fill={BannerColors.THIRD_TEXT_COLOR}
			x={localX}
			y={localY}
		>
			{timeText}
		</text>
	);
};

export const BannerActivity = () => {
	return (
		<>
			<ActivityType />
			<ActivityImage />
			<ActivityName />
			<ActivityStartTime />
		</>
	);
};
