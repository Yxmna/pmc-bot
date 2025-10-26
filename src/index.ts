import { Client, Events, GatewayIntentBits } from "discord.js";
import { CFG } from "./config.js";
import { onInteractionCreate } from "./handlers/interactions.js";
import { onGuildMemberAdd } from "./handlers/welcome.js";

async function main() {
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
	});

	client.once(Events.ClientReady, async () => {
		console.log(`Logged in as ${client.user?.tag}`);

		// Vérifier si une autre instance est connectée
		const guilds = await client.guilds.fetch();
		for (const [, guild] of guilds) {
			const fullGuild = await guild.fetch();
			const botMembers = fullGuild.members.cache.filter(
				m => m.user.id === client.user?.id && m.presence?.status === "online"
			);
			if (botMembers.size > 1) {
				console.error("⚠️  ATTENTION: Une autre instance du bot semble déjà connectée!");
				console.error("   Cela peut causer des erreurs 'Unknown interaction'.");
				console.error("   Vérifiez qu'aucun autre développeur n'a le bot lancé.");
			}
		}
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
