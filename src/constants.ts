export const IDS = {
	BTN_SET_USERNAME: "btn:set_username",
	MODAL_SET_USERNAME: "modal:set_username",
	INPUT_USERNAME: "input:mc_username",
} as const;

export const COLORS = {
	info: 0x4aa3ff,
	warn: 0xffc107,
	error: 0xff4d4d,
	success: 0x30d158,
} as const;

export const MC_NAME_REGEX = /^[A-Za-z0-9_]{3,16}$/;
