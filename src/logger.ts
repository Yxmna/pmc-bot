import {
	ChannelType,
	type Client,
	EmbedBuilder,
	TextChannel,
} from "discord.js";
import { CFG } from "./config.js";
import { COLORS } from "./constants.js";
import { type TextKey, t, type Vars } from "./strings.js";

type LogType = "info" | "warn" | "error";

async function getLogsChannel(client: Client): Promise<TextChannel | null> {
	const cached = client.channels.cache.get(CFG.LOGS_CHANNEL_ID);
	if (cached instanceof TextChannel) return cached;
	const fetched = await client.channels
		.fetch(CFG.LOGS_CHANNEL_ID)
		.catch(() => null);
	return fetched && fetched.type === ChannelType.GuildText
		? (fetched as TextChannel)
		: null;
}

export async function logger(
	client: Client,
	type: LogType,
	key: TextKey,
	vars: Vars = {},
): Promise<void> {
	const ch = await getLogsChannel(client);
	if (!ch) return;

	const titleKey = `${key}_title` as TextKey;

	const title = t(titleKey, vars) || "";
	let description = t(key, vars) || "";
	if (!title && !description) {
		description = `(${String(key)})`;
	}

	const emb = new EmbedBuilder().setColor(COLORS[type]);

	if (title) {
		emb.setTitle(title);
	}
	if (description) {
		emb.setDescription(description);
	}

	await ch.send({ embeds: [emb] });
}
