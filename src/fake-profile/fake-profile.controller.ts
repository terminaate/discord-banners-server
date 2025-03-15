import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfileEffectsService } from '@/fake-profile/profile-effects.service';
import { AvatarDecorationsService } from '@/fake-profile/avatar-decorations.service';

@Controller()
export class FakeProfileController {
  constructor(
    private profileEffectsService: ProfileEffectsService,
    private avatarDecorationsService: AvatarDecorationsService,
  ) {}

  @Get('profile-effects')
  @HttpCode(HttpStatus.OK)
  getProfileEffects() {
    return this.profileEffectsService.getAll();
  }

  @Get('decorations')
  @HttpCode(HttpStatus.OK)
  getAvatarDecorations() {
    return this.avatarDecorationsService.getAll();
  }
}
