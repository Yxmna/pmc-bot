import "dotenv/config";
import process from "node:process";
import { z } from "zod";

const Schema = z.object({
	DISCORD_TOKEN: z.string().min(1),
	WELCOME_CHANNEL_ID: z.string().min(1),
	LOGS_CHANNEL_ID: z.string().min(1),
	JOUEUR_ROLE_ID: z.string().min(1),
});

const parsed = Schema.safeParse(process.env);
if (!parsed.success) {
	console.error(
		"Config error:",
		parsed.error.flatten((issue) => issue.message).fieldErrors,
	);
	process.exit(1);
}

export const CFG = {
	DISCORD_TOKEN: parsed.data.DISCORD_TOKEN,
	WELCOME_CHANNEL_ID: parsed.data.WELCOME_CHANNEL_ID,
	LOGS_CHANNEL_ID: parsed.data.LOGS_CHANNEL_ID,
	JOUEUR_ROLE_ID: parsed.data.JOUEUR_ROLE_ID,
} as const;
