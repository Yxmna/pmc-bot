import {
	ChannelType,
	type Client,
	EmbedBuilder,
	PermissionFlagsBits,
	type TextChannel,
} from "discord.js";
import { CFG } from "./config.js";
import { COLORS } from "./constants.js";
import { buildPermsRecheckRow } from "./ui.js";

const REQUIRED_GLOBAL = [
	{ id: PermissionFlagsBits.ManageRoles, label: "Gérer les rôles" },
	{ id: PermissionFlagsBits.ManageNicknames, label: "Gérer les pseudos" },
];

const REQUIRED_CHANNELS = [
	{
		channelId: CFG.WELCOME_CHANNEL_ID,
		label: "Salon bienvenue",
		perms: [
			{ id: PermissionFlagsBits.ViewChannel, label: "Voir le salon" },
			{ id: PermissionFlagsBits.SendMessages, label: "Envoyer des messages" },
			// { id: PermissionFlagsBits.EmbedLinks, label: "Intégrer des liens" },
		],
	},
	{
		channelId: CFG.LOGS_CHANNEL_ID,
		label: "Salon logs",
		perms: [
			{ id: PermissionFlagsBits.ViewChannel, label: "Voir le salon" },
			{ id: PermissionFlagsBits.SendMessages, label: "Envoyer des messages" },
			{ id: PermissionFlagsBits.EmbedLinks, label: "Intégrer des liens" },
		],
	},
];

function checkbox(ok: boolean): string {
	return ok ? "✅" : "❌";
}

async function getTextChannel(
	client: Client,
	id: string,
): Promise<TextChannel | null> {
	try {
		const ch = await client.channels.fetch(id);
		if (ch && ch.type === ChannelType.GuildText) return ch as TextChannel;
	} catch {}
	return null;
}

export async function reportPermissionsOnBoot(client: Client): Promise<void> {
	const logsChannel = await getTextChannel(client, CFG.LOGS_CHANNEL_ID);
	if (!logsChannel) {
		console.warn("[perm] Salon logs introuvable ou non textuel");
		return;
	}

	await logsChannel.guild.members.fetchMe();
	const me = logsChannel.guild.members.me;
	if (!me) {
		console.warn("[perm] Impossible de récupérer le membre bot");
		return;
	}

	let hasMissing = false;
	const fields: { name: string; value: string; inline?: boolean }[] = [];

	const welcome = await getTextChannel(client, CFG.WELCOME_CHANNEL_ID);
	if (!welcome) {
		hasMissing = true;
		fields.push({
			name: "Ping rôle au bienvenue",
			value: "❌ Salon bienvenue introuvable",
			inline: false,
		});
	}

	let globalValue = "";
	for (const req of REQUIRED_GLOBAL) {
		const ok = me.permissions.has(req.id);
		if (!ok) hasMissing = true;
		globalValue += `${checkbox(ok)} ${req.label}\n`;
	}

	const joueurRole =
		logsChannel.guild.roles.cache.get(CFG.JOUEUR_ROLE_ID) ??
		(await logsChannel.guild.roles.fetch(CFG.JOUEUR_ROLE_ID).catch(() => null));

	if (!joueurRole) {
		hasMissing = true;
		globalValue += `❌ Rôle joueur introuvable\n`;
	} else {
		const okEditable = joueurRole.editable;
		if (!okEditable) hasMissing = true;
		globalValue += `${okEditable ? "✅" : "❌"} Peut attribuer le rôle <@&${joueurRole.id}>\n`;
	}

	fields.push({
		name: "Permissions globales",
		value: globalValue.trim() || "Aucune",
		inline: false,
	});

	for (const cfg of REQUIRED_CHANNELS) {
		let ch: TextChannel | null = null;
		try {
			const fetched = await client.channels.fetch(cfg.channelId);
			if (fetched && fetched.type === ChannelType.GuildText)
				ch = fetched as TextChannel;
		} catch {}

		if (!ch) {
			hasMissing = true;
			fields.push({
				name: `${cfg.label} <#${cfg.channelId}>`,
				value: "❌ Impossible d’accéder à ce salon",
				inline: false,
			});
			continue;
		}

		const perms = me.permissionsIn(ch);

		const canView = perms.has(PermissionFlagsBits.ViewChannel);
		const canSend = perms.has(PermissionFlagsBits.SendMessages);
		if (!canView || !canSend) hasMissing = true;

		let value = "";
		value += `${checkbox(canView && canSend)} Utiliser le salon\n`;

		for (const req of cfg.perms) {
			if (
				req.id === PermissionFlagsBits.ViewChannel ||
				req.id === PermissionFlagsBits.SendMessages
			) {
				continue;
			}
			const ok = perms.has(req.id);
			if (!ok) hasMissing = true;
			value += `${checkbox(ok)} ${req.label}\n`;
		}

		fields.push({
			name: `${cfg.label} <#${cfg.channelId}>`,
			value: value.trim(),
			inline: false,
		});
	}

	const embed = new EmbedBuilder()
		.setTitle("Permissions du bot")
		.addFields(fields)
		.setColor(hasMissing ? COLORS.warn : COLORS.success);

	await logsChannel.send({
		embeds: [embed],
		components: [buildPermsRecheckRow()],
	});
}
