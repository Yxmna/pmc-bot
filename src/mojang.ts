import { MC_NAME_REGEX } from "./constants.js";

export interface MojangProfile {
	id: string;
	name: string;
}

export async function getProfileByName(
	input: string,
): Promise<MojangProfile | null> {
	const trimmed = input.trim();
	if (!MC_NAME_REGEX.test(trimmed)) return null;

	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 5000); // 5s
	try {
		const res = await fetch(
			`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(trimmed)}`,
			{ signal: ctrl.signal },
		);
		if (res.status === 200) return (await res.json()) as MojangProfile;
		if (res.status === 204 || res.status === 404) return null;
		throw new Error(`Mojang API error ${res.status}`);
	} finally {
		clearTimeout(t);
	}
}
