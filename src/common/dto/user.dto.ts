import { ActivityType, GuildMember } from 'discord.js';

const DEFAULT_ACCENT_COLOR = '#f1c40f';

export class UserDTO {
  id: string;
  username: string;
  avatar: string;
  banner?: string | null;
  status?: string | null;
  customStatus?: string | null;
  publicFlags?: number | null;
  accentColor: string;
  premiumSince?: number | null;
  profileEffect?: string;
  avatarDecoration?: string | null;

  constructor(member: GuildMember, profileEffect?: string) {
    const accentColor =
      member.displayHexColor !== DEFAULT_ACCENT_COLOR
        ? member.displayHexColor
        : '#000';

    this.id = member.id;
    this.username = member.user.tag.toLowerCase();
    this.avatar = member.displayAvatarURL({ size: 256, extension: 'png' });
    this.banner = member.user.bannerURL({ size: 1024, extension: 'png' });
    this.status = member.presence?.status ?? 'offline';
    this.publicFlags = member.user.flags?.bitfield;
    this.accentColor = accentColor;
    this.premiumSince = member.premiumSinceTimestamp;
    this.avatarDecoration = member.user.avatarDecorationData?.asset;
    this.profileEffect = profileEffect;

    this.customStatus = member.presence?.activities.find(
      (activity) => activity.type === ActivityType.Custom,
    )?.state;
  }
}
