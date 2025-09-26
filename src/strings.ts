import texts from "./texts.json";

export type Vars = Record<string, string | number>;
export type TextKey = keyof typeof texts;

export function t(key: TextKey, vars: Vars = {}): string {
	const base = texts[key];
	let out = typeof base === "string" ? base : "";
	for (const [k, v] of Object.entries(vars)) {
		out = out.replaceAll(`{${k}}`, String(v));
	}
	return out;
}
