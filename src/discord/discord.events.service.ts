import { Injectable, Logger } from '@nestjs/common';
import { Context, ContextOf, On, Once } from 'necord';
import { DiscordService } from '@/discord/discord.service';

@Injectable()
export class DiscordEventsService {
  private readonly logger = new Logger(DiscordEventsService.name);

  constructor(private discordService: DiscordService) {}

  @Once('ready')
  public onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Logged in as ${client.user?.tag}!`);
  }

  @On('guildMemberUpdate')
  public onMemberUpdate(
    @Context() [, newMember]: ContextOf<'guildMemberUpdate'>,
  ) {}

  @On('guildMemberAdd')
  public onMemberAdd(@Context() [member]: ContextOf<'guildMemberAdd'>) {}

  @On('presenceUpdate')
  public onPresenceUpdate(
    @Context() [, newPresence]: ContextOf<'presenceUpdate'>,
  ) {}
}
