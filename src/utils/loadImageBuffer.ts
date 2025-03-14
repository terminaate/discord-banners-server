import axios from 'axios';

export const loadImageBuffer = async (url: string) => {
	return (
		await axios({
			url,
			responseType: 'arraybuffer',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
			},
		})
	).data;
};
