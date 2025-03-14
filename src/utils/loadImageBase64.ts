import axios from 'axios';
import fs from 'fs/promises';

const cache = new Map<string, string>();

const mimeTypeMap: { [key: string]: string } = {
	png: 'image/png',
	jpg: 'image/jpeg',
	webp: 'image/webp',
	gif: 'image/gif',
	svg: 'image/svg+xml',
};

export const loadImageBase64 = async (url: string, local = false) => {
	if (cache.has(url)) {
		// console.log('getting image from cache', url);
		return cache.get(url);
	}

	let base64;

	if (local) {
		const ext = url.split('.').pop();

		const buffer = await fs.readFile(url);

		const dataType = mimeTypeMap[ext as string] || 'application/octet-stream';

		base64 = `data:${dataType};base64,${buffer.toString('base64')}`;
	} else {
		const { data, headers } = await axios({
			url,
			responseType: 'arraybuffer',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
			},
		});
		const contentType = headers['Content-Type'];

		base64 = `data:${contentType};base64,${data.toString('base64')}`;
	}

	cache.set(url, base64);

	return base64;
};
