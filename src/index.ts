import { Client, Events, GatewayIntentBits } from "discord.js";
import { CFG } from "./config.js";
import { onInteractionCreate } from "./handlers/interactions.js";
import { onGuildMemberAdd } from "./handlers/welcome.js";

async function main() {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
	});

	client.once(Events.ClientReady, () => {
		console.log(`Logged in as ${client.user?.tag}`);
	});

	client.on(Events.GuildMemberAdd, (member) => {
		onGuildMemberAdd(member);
	});

	client.on(Events.InteractionCreate, (interaction) => {
		onInteractionCreate(client, interaction);
	});

	await client.login(CFG.DISCORD_TOKEN);
}

main().catch((err) => {
	console.error("Fatal boot error:", err);
	process.exit(1);
});
