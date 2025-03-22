import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerOptions } from '@/banner/types/banner-options';

@Entity()
export class BannerRenderRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  layersTime: Record<string, number>;

  @Column('int')
  time: number;

  @Column('jsonb')
  userData: UserDTO;

  @Column('jsonb')
  bannerOptions: BannerOptions;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  size: string;
}
