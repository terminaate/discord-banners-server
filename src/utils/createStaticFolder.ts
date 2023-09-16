import fs from 'fs';
import path from 'path';

export const createStaticFolder = () => {
	try {
		if (fs.readdirSync(path.resolve(__dirname, '../static/')) === null) {
			fs.mkdirSync(path.resolve(__dirname, '../static/'));
		}
	} catch (e) {
		fs.mkdirSync(path.resolve(__dirname, '../static/'));
	}
};
