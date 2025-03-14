import { Image } from 'canvas';

export const createImageFromBuffer = async (
	src: string | Buffer<ArrayBufferLike>,
) => {
	const image = new Image();

	return new Promise<Image>((resolve) => {
		image.onload = () => {
			resolve(image);
		};
		image.src = src;
	});
};
