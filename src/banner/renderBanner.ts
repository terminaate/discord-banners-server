// import { registerWindow, SVG } from '@svgdotjs/svg.js';
//
// export const renderBanner = async () => {
// 	const { createSVGWindow } = await import('svgdom');
//
// 	const window = createSVGWindow();
// 	const document = window.document;
//
// 	// register window and document
// 	registerWindow(window, document);
//
// 	// create canvas
// 	const canvas = SVG(document.documentElement);
//
// 	// use svg.js as normal
// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 	// @ts-expect-error
// 	canvas.rect(100, 100).fill('yellow').move(50, 50);
//
// 	// get your svg as string
// 	console.log(canvas.svg());
// 	// or
// 	console.log(canvas.node.outerHTML);
// 	return canvas.svg();
// };

export const renderBanner = async (): Promise<string> => {
	return 'zxc';
};
