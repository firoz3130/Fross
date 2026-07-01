import { createCategoryWords, createGenericHints } from "./categoryFactory";

const FRUITS_WORDS = [
	"STRAWBERRY",
	"PINEAPPLE",
	"BLUEBERRY",
	"RASPBERRY",
	"BLACKBERRY",
	"WATERMELON",
	"HONEYDEW",
	"AVOCADO",
	"POMEGRANATE",
	"NECTARINE",
	"CLEMENTINE",
	"TANGERINE",
	"PERSIMMON",
	"CANTALOUPE",
	"DRAGONFRUIT",
	"KIWIFRUIT",
	"GRAPEFRUIT",
	"PAPAYA",
	"MANGO",
	"PLUM",
	"PEACH",
	"CHERRY",
	"APPLE",
	"BANANA",
	"ORANGE",
	"PEAR",
	"FIG",
	"DATE",
	"LYCHEE",
	"JACKFRUIT",
];

export const FRUITS = createCategoryWords(FRUITS_WORDS, "Fruits", (word) => {
	const manualHints: Record<string, [string, string, string]> = {
		BANANA: [
			"A yellow tropical fruit",
			"A favorite snack for monkeys",
			"Rich in potassium",
		],
		WATERMELON: [
			"A juicy summer fruit",
			"Often served as slices",
			"Has a green rind",
		],
		APPLE: [
			"A common garden fruit",
			"Often said to keep the doctor away",
			"Comes in many varieties",
		],
		MANGO: [
			"A tropical fruit with a sweet flavor",
			"Popular in South Asia",
			"Known for its fragrant aroma",
		],
	};

	return manualHints[word] ?? createGenericHints(word, "Fruits");
});
