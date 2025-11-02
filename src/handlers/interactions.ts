import type { Client, GuildMember, Interaction } from "discord.js";
import { CFG } from "../config.js";
import { IDS, MC_NAME_REGEX } from "../constants.js";
import { logger } from "../logger.js";
import { getProfileByName } from "../mojang.js";
import { reportPermissionsOnBoot } from "../permissions.js";
import { t } from "../strings.js";
import { buildUsernameModal } from "../ui.js";

export async function onInteractionCreate(
	client: Client,
	interaction: Interaction,
): Promise<void> {
	try {
		if (!interaction.inCachedGuild()) return;

		const guild = interaction.guild;
		if (!guild) return;

		if (
			interaction.isButton() &&
			interaction.customId === IDS.BTN_RECHECK_PERMS
		) {
			await interaction.deferUpdate();
			await reportPermissionsOnBoot(client);
			return;
		}

		if (
			interaction.isButton() &&
			interaction.customId === IDS.BTN_SET_USERNAME
		) {
			const modal = buildUsernameModal();
			await interaction.showModal(modal);
		}

		if (
			interaction.isModalSubmit() &&
			interaction.customId === IDS.MODAL_SET_USERNAME
		) {
			await interaction.deferReply({ ephemeral: true });

			const raw =
				interaction.fields.getTextInputValue(IDS.INPUT_USERNAME) || "";
			const trimmed = raw.trim();

			if (!MC_NAME_REGEX.test(trimmed)) {
				await interaction.editReply({
					content: t("error_invalid_format"),
				});
				await logger(client, "warn", "log_invalid_submit", {
					userTag: interaction.user.tag,
					userMention: `<@${interaction.user.id}>`,
					typed: raw,
				});
				return;
			}

			let profile = null;
			try {
				profile = await getProfileByName(trimmed);
			} catch (apiErr) {
				await interaction.editReply({
					content: t("error_mojang"),
				});
				await logger(client, "error", "log_mojang_error", {
					userTag: interaction.user.tag,
					userMention: `<@${interaction.user.id}>`,
					error: (apiErr as Error).message,
				});
				return;
			}

			if (!profile) {
				await interaction.editReply({
					content: t("error_nickname_not_found"),
				});
				await logger(client, "warn", "log_nickname_error", {
					userTag: interaction.user.tag,
					userMention: `<@${interaction.user.id}>`,
					typed: raw,
				});
				return;
			}

			const gm: GuildMember = await guild.members.fetch(interaction.user.id);
			const joueurRole = guild.roles.cache.get(CFG.JOUEUR_ROLE_ID);
			if (!joueurRole) {
				await interaction.editReply({
					content: t("error_missing_role"),
				});
				return;
			}

			const targetName = profile.name;
			const currentName = gm.nickname ?? gm.user.username;

			try {
				await gm.setNickname(targetName, "Validé via Mojang");
			} catch (e: unknown) {
				console.log(e);
				await interaction.editReply({
					content: t("error_cannot_nick"),
				});
				await logger(client, "error", "log_cannot_nick", {
					userTag: interaction.user.tag,
					userMention: `<@${interaction.user.id}>`,
					oldName: currentName,
					newName: targetName,
					error: String(e),
				});
				return;
			}

			try {
				if (!gm.roles.cache.has(joueurRole.id)) {
					await gm.roles.add(joueurRole, "Accès joueur validé");
				}
			} catch (e: unknown) {
				console.log("Error : ", e);
				console.log("Guild Member :", gm);

				await interaction.editReply({
					content: t("error_cannot_role"),
				});
				await logger(client, "error", "log_cannot_role", {
					userTag: interaction.user.tag,
					userMention: `<@${interaction.user.id}>`,
					error: String(e),
				});
				return;
			}

			interaction.editReply({
				content: t("success"),
			});

			await logger(client, "info", "log_success", {
				userTag: interaction.user.tag,
				userMention: `<@${interaction.user.id}>`,
				oldName: currentName,
				newName: targetName,
			});
		}
	} catch (err) {
		try {
			const content = t("error_generic");

			if (!interaction.isRepliable()) {
			} else if (!interaction.deferred && !interaction.replied) {
				await interaction.reply({ content, ephemeral: true });
			} else {
				await interaction.editReply({ content });
			}
		} catch {}

		try {
			await logger(client, "error", "log_generic_error", {
				userTag: interaction?.user?.tag ?? "unknown",
				userMention: interaction?.user
					? `<@${interaction.user.id}>`
					: "@unknown",
				error: String(err),
			});
		} catch {}

		console.error("onInteractionCreate error:", err);
	}
}
