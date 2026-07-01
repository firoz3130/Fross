import { createCategoryWords, createGenericHints } from "./categoryFactory";

const HOUSEHOLD_WORDS = [
	"TELEVISION",
	"MICROWAVE",
	"REFRIGERATOR",
	"COFFEE",
	"PILLOW",
	"BLENDER",
	"LAMP",
	"SOFA",
	"CABINET",
	"UMBRELLA",
	"VACUUM",
	"MATTRESS",
	"FAN",
	"CHARGER",
	"DISHWASHER",
	"MIRROR",
	"TOASTER",
	"CURTAINS",
	"BASKET",
	"KETTLE",
	"TABLE",
	"CHAIR",
	"SINK",
	"CUTLERY",
	"BLANKET",
	"SHOWER",
	"CUPBOARD",
	"CLOCK",
	"BATHTUB",
	"PLATE",
];

export const HOUSEHOLD = createCategoryWords(
	HOUSEHOLD_WORDS,
	"Household Items",
	(word) => {
		const manualHints: Record<string, [string, string, string]> = {
			CHAIR: [
				"A piece of furniture",
				"Used for sitting",
				"Common in dining rooms",
			],
			LAMP: [
				"A household light source",
				"Often sits on a table",
				"Provides illumination",
			],
			TOASTER: [
				"An electrical kitchen device",
				"Used for bread",
				"Makes toast",
			],
			REFRIGERATOR: [
				"A large kitchen appliance",
				"Keeps food cool",
				"Often found in the kitchen",
			],
		};

		return manualHints[word] ?? createGenericHints(word, "Household Items");
	},
);
