export interface Theme {
	id: string;
	name: string;
	background: string;
	primaryColor: string;
	secondaryColor: string;
	accentColor: string;
	wordList: string[];
	animationClass?: string;
	unlockLevel: number;
}

export const THEMES: Theme[] = [
	{
		id: "default",
		name: "Classic",
		background: "linear-gradient(135deg, #eef2f8 0%, #d6e4f0 100%)",
		primaryColor: "#4c7dff",
		secondaryColor: "#7f9fff",
		accentColor: "#ffcc4d",
		wordList: [],
		unlockLevel: 0,
	},
	{
		id: "space",
		name: "Space Adventure",
		background:
			"linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
		primaryColor: "#00d4ff",
		secondaryColor: "#090979",
		accentColor: "#ffd700",
		wordList: [
			"galaxy",
			"rocket",
			"planet",
			"star",
			"cosmos",
			"orbit",
			"nebula",
			"meteor",
		],
		animationClass: "space-float",
		unlockLevel: 1,
	},
	{
		id: "ocean",
		name: "Ocean Quest",
		background:
			"linear-gradient(135deg, #0077be 0%, #00a8cc 50%, #00d4ff 100%)",
		primaryColor: "#00d4ff",
		secondaryColor: "#0077be",
		accentColor: "#ffd700",
		wordList: [
			"wave",
			"coral",
			"shark",
			"turtle",
			"ocean",
			"shell",
			"dolphin",
			"reef",
		],
		animationClass: "ocean-wave",
		unlockLevel: 4,
	},
	{
		id: "fantasy",
		name: "Fantasy Realm",
		background:
			"linear-gradient(135deg, #4b0082 0%, #8a2be2 50%, #dda0dd 100%)",
		primaryColor: "#dda0dd",
		secondaryColor: "#8a2be2",
		accentColor: "#ffd700",
		wordList: [
			"magic",
			"dragon",
			"castle",
			"wizard",
			"elf",
			"potion",
			"sword",
			"quest",
		],
		animationClass: "fantasy-glow",
		unlockLevel: 7,
	},
	{
		id: "mystic",
		name: "Mystic Realm",
		background:
			"linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #daa520 100%)",
		primaryColor: "#daa520",
		secondaryColor: "#8b4513",
		accentColor: "#ffd700",
		wordList: [
			"magic",
			"mystic",
			"spell",
			"enchant",
			"wizard",
			"potion",
			"rune",
			"talisman",
		],
		animationClass: "mystic-pulse",
		unlockLevel: 11,
	},
];
