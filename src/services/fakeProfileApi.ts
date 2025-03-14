import axios from 'axios';

const baseURL = 'https://fakeprofile.is-always.online';

export const fakeProfileApi = axios.create({
	baseURL,
});
