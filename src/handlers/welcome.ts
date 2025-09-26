import type { GuildMember, TextChannel } from "discord.js";
import { CFG } from "../config.js";
import { logger } from "../logger.js";
import { buildWelcomeButtonRow, buildWelcomeContent } from "../ui.js";

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
	try {
		if (member.user.bot) return;
		if (member.roles.cache.has(CFG.JOUEUR_ROLE_ID)) return;

		const ch = await member.client.channels.fetch(CFG.WELCOME_CHANNEL_ID);
		if (!ch?.isTextBased()) return;

		const content = buildWelcomeContent(member.id, CFG.JOUEUR_ROLE_ID);
		const row = buildWelcomeButtonRow();

		await (ch as TextChannel).send({ content, components: [row] });

		await logger(member.client, "info", "log_welcome", {
			userTag: member.user.tag,
			userMention: `<@${member.id}>`,
		});
	} catch (err) {
		console.error("Erreur welcome:", err);
	}
}
