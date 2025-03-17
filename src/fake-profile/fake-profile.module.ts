import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FakeProfileService } from '@/fake-profile/fake-profile.service';
import { AvatarDecorationsService } from '@/fake-profile/avatar-decorations.service';
import { ProfileEffectsService } from '@/fake-profile/profile-effects.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FakeProfileController } from '@/fake-profile/fake-profile.controller';
import ms from 'ms';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return { baseURL: configService.get('FAKE_PROFILE_API') as string };
      },
    }),
    CacheModule.register({ ttl: ms('2m') }),
  ],
  controllers: [FakeProfileController],
  providers: [
    FakeProfileService,
    AvatarDecorationsService,
    ProfileEffectsService,
  ],
  exports: [
    FakeProfileService,
    AvatarDecorationsService,
    ProfileEffectsService,
  ],
})
export class FakeProfileModule {}
