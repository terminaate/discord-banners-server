import { Image } from 'canvas';

export const createImageFromBuffer = async (src: Buffer) => {
	const image = new Image();

	return new Promise<Image>((resolve) => {
		image.onload = () => {
			resolve(image);
		};
		image.src = src;
	});
};
