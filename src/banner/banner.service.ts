import { Injectable } from '@nestjs/common';
import { BannerRenderService } from '@/banner/banner-render.service';
import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerOptions } from '@/banner/types/banner-options';
import { formatBytes } from '@/common/utils/formatBytes';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerRenderRecordEntity } from '@/banner/entities/banner-render-record.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class BannerService {
  constructor(
    private renderService: BannerRenderService,
    @InjectRepository(BannerRenderRecordEntity)
    private renderRecordsRepository: Repository<BannerRenderRecordEntity>,
  ) {}

  async getStats(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.renderRecordsRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async renderBanner(
    member: GuildMember,
    activities?: Activity[],
    overwrites?: Partial<Record<keyof UserDTO, string>>,
    bannerOptions?: BannerOptions,
  ) {
    const startTime = Date.now();

    const filteredActivities =
      activities
        ?.filter((o) => o.type !== ActivityType.Custom)
        .map((o) => new UserActivityDTO(o))
        .slice(0, 2) ?? [];

    const userDto = new UserDTO(member);
    Object.assign(userDto, overwrites);

    const { canvas, stats } = await this.renderService.create(
      userDto,
      filteredActivities,
      bannerOptions,
    );

    const svg = canvas.toBuffer().toString();

    const endTime = Date.now();

    const elapsedTime = endTime - startTime;
    const size = formatBytes(svg.length);

    const newEntity = this.renderRecordsRepository.create({
      size,
      time: elapsedTime,
      layersTime: stats,
      bannerOptions: bannerOptions ?? { animated: true },
      userData: userDto,
    });

    await this.renderRecordsRepository.save(newEntity);

    return svg;
  }
}
