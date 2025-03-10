export const hashJson = async (jsonObj: any) => {
	const jsonStr = JSON.stringify(jsonObj, Object.keys(jsonObj).sort());
	const encoder = new TextEncoder();
	const data = encoder.encode(jsonStr);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hashBuffer))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};
