import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { IDS } from "./constants.js";
import { t } from "./strings.js";

export function buildWelcomeContent(userId: string, roleId: string): string {
	return t("welcome", { user: `<@${userId}>`, role: `<@&${roleId}>` });
}

export function buildWelcomeButtonRow(): ActionRowBuilder<ButtonBuilder> {
	const button = new ButtonBuilder()
		.setCustomId(IDS.BTN_SET_USERNAME)
		.setLabel(t("button_set_username"))
		.setStyle(ButtonStyle.Primary);
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
	return row;
}

export function buildUsernameModal(): ModalBuilder {
	const input = new TextInputBuilder()
		.setCustomId(IDS.INPUT_USERNAME)
		.setLabel(t("modal_label_username"))
		.setPlaceholder(t("modal_placeholder"))
		.setStyle(TextInputStyle.Short)
		.setRequired(true)
		.setMinLength(3)
		.setMaxLength(16);

	const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
	const modal = new ModalBuilder()
		.setCustomId(IDS.MODAL_SET_USERNAME)
		.setTitle(t("modal_title"))
		.addComponents(row);

	return modal;
}
