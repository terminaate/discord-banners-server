import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AvatarDecoration } from '@/fake-profile/types/avatar-decoration';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AvatarDecorationsService {
  private readonly logger = new Logger(AvatarDecorationsService.name);

  private decorations: AvatarDecoration[] = [];

  constructor(private httpService: HttpService) {
    void this.init();
  }

  getDecorationUrl(asset: string, animated = true): string | undefined {
    const decoration = this.decorations.find((o) => o.asset === asset);
    if (!decoration) {
      return;
    }

    return `https://cdn.discordapp.com/avatar-decoration-presets/${decoration.asset}?passthrough=${animated}`;
  }

  getAll() {
    return this.decorations;
  }

  getDecorationByAsset(asset: string) {
    return this.decorations.find((o) => o.asset === asset);
  }

  @Cron('0 * * * *')
  private async init() {
    const { data: decorations } =
      await this.httpService.axiosRef.get<typeof this.decorations>(
        '/decorations',
      );

    this.decorations = decorations;

    this.logger.log('Avatar decorations effects retrieved');
  }
}
