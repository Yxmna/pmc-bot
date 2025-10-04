# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pmc-bot** is a Discord bot that validates Minecraft player accounts for server access. When new members join, they must verify their Minecraft username via Mojang API to receive the "Joueur" role and set their Discord nickname to their MC username.

## Core Architecture

### Event Flow

1. **Welcome Flow** (`src/handlers/welcome.ts`)
   - Triggered on `GuildMemberAdd` event
   - Sends welcome message with verification button to configured channel
   - Skips if user is a bot or already has Joueur role

2. **Interaction Flow** (`src/handlers/interactions.ts`)
   - Button click → shows modal for username input
   - Modal submit → validates username format (3-16 chars, alphanumeric + underscore)
   - Queries Mojang API to verify username exists
   - Sets Discord nickname to verified MC username
   - Assigns Joueur role on success
   - All steps have error handling with user feedback and logging

### Key Modules

- **mojang.ts**: Mojang API integration with 5s timeout
- **logger.ts**: Centralized Discord embed logging to LOGS_CHANNEL_ID
- **ui.ts**: Discord component builders (buttons, modals)
- **strings.ts**: i18n system using `src/texts.json` with variable interpolation
- **config.ts**: Environment validation via Zod schema

### Configuration

Required environment variables (validated at startup):
- `DISCORD_TOKEN`: Bot authentication
- `WELCOME_CHANNEL_ID`: Where welcome messages are sent
- `LOGS_CHANNEL_ID`: Where bot logs are posted
- `JOUEUR_ROLE_ID`: Role assigned to verified players

### Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Technical Details

- **TypeScript**: ES modules with NodeNext resolution (all imports need `.js` extension)
- **Discord.js v14**: Uses Guilds and GuildMembers intents
- **Validation**: Minecraft usernames via regex `/^[A-Za-z0-9_]{3,16}$/`
- **Error Handling**: Comprehensive try-catch with user-friendly messages and detailed logging
