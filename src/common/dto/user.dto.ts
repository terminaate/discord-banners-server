import { ActivityType, GuildMember, UserFlags } from 'discord.js';

const DEFAULT_ACCENT_COLOR = '#f1c40f';

export class UserDTO {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string;
  banner?: string | null;
  status?: string | null;
  customStatus?: string | null;
  flags?: (keyof typeof UserFlags)[] | null;
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
    this.globalName =
      member.user.globalName !== this.username ? member.user.globalName : null;
    this.avatar = member.displayAvatarURL({ size: 128, extension: 'png' });
    this.banner = member.user.bannerURL({ size: 128, extension: 'png' });
    this.status = member.presence?.status ?? 'offline';
    this.flags = member.user.flags?.toArray();
    this.accentColor = accentColor;
    this.premiumSince = member.premiumSinceTimestamp;
    this.avatarDecoration = member.user.avatarDecorationData?.asset;
    this.profileEffect = profileEffect;

    // TODO?: maybe add createdAt layer

    this.customStatus = member.presence?.activities.find(
      (activity) => activity.type === ActivityType.Custom,
    )?.state;
  }
}
