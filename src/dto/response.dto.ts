export class ResponseDTO {
	constructor(
		public message: string | string[],
		public statusCode: number,
	) {}
}
