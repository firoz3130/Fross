import { createCategoryWords, createGenericHints } from "./categoryFactory";

const ANIMALS_WORDS = [
	"ELEPHANT",
	"KANGAROO",
	"ALLIGATOR",
	"GIRAFFE",
	"CHAMELEON",
	"HIPPOPOTAMUS",
	"BUTTERFLY",
	"CHEETAH",
	"PORCUPINE",
	"RACCOON",
	"FLAMINGO",
	"ARMADILLO",
	"HEDGEHOG",
	"OSTRICH",
	"WOODPECKER",
	"PELICAN",
	"KOALA",
	"ANTELOPE",
	"SEAOTTER",
	"WALRUS",
	"ALBATROSS",
	"MOOSE",
	"PENGUIN",
	"SQUIRREL",
	"DOLPHIN",
	"TURTLE",
	"RABBIT",
	"HUMMINGBIRD",
	"OCTOPUS",
	"SEAHORSE",
];

export const ANIMALS = createCategoryWords(ANIMALS_WORDS, "Animals", (word) => {
	const manualHints: Record<string, [string, string, string]> = {
		ELEPHANT: [
			"A large land mammal",
			"Known for its trunk",
			"Often found in Africa and Asia",
		],
		GIRAFFE: [
			"A tall African herbivore",
			"Known for its long neck",
			"Has spots all over its body",
		],
		KOALA: [
			"A marsupial from Australia",
			"Lives in eucalyptus trees",
			"Often sleeps for long hours",
		],
		OCTOPUS: [
			"A smart sea creature",
			"Has eight arms",
			"Can change color quickly",
		],
	};

	return manualHints[word] ?? createGenericHints(word, "Animals");
});
