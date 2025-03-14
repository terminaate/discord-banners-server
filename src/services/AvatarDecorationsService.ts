import { AvatarDecoration } from '@/types/AvatarDecoration';
import { fakeProfileApi } from '@/services/fakeProfileApi';

export class AvatarDecorationsService {
	private static decorations: AvatarDecoration[] = [];

	public static getAll() {
		return this.decorations;
	}

	public static async init() {
		const { data: decorations } =
			await fakeProfileApi.get<typeof this.decorations>('/decorations');

		this.decorations = decorations;

		console.log('Avatar decorations effects retrieved');
	}

	public static getDecorationByAsset(asset: string) {
		return this.decorations.find((o) => o.asset === asset);
	}

	public static getDecorationUrl(
		asset: string,
		animated = true,
	): string | undefined {
		const decoration = this.decorations.find((o) => o.asset === asset);
		if (!decoration) {
			return;
		}

		return `https://cdn.discordapp.com/avatar-decoration-presets/${decoration.asset}?passthrough=${animated}`;
	}
}
