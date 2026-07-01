import { ANIMALS } from "./animals";
import { COUNTRIES } from "./countries";
import { FRUITS } from "./fruits";
import { HOUSEHOLD } from "./household";
import { MOVIES } from "./movies";
import { PROGRAMMING } from "./programming";
import { SPORTS } from "./sports";
import { SPORTS_PERSONS } from "./sportsPersons";
import type { HangmanCategoryRaw } from "./types";

const DEV_TEST_WORDS: HangmanCategoryRaw = {
	name: "DEV TEST DatabaseV1.1",
	words: [
		{
			word: "FIROS",
			hints: [
				"A developer test word",
				"Used for validation",
				"Short and memorable",
			],
		},
		{
			word: "FIRU",
			hints: [
				"A developer test word",
				"Used for validation",
				"Short and memorable",
			],
		},
	],
};

export const HANGMAN_CATEGORIES: HangmanCategoryRaw[] = [
	DEV_TEST_WORDS,
	{ name: "Animals", words: ANIMALS },
	{ name: "Fruits", words: FRUITS },
	{ name: "Countries", words: COUNTRIES },
	{ name: "Movies", words: MOVIES },
	{ name: "Sports", words: SPORTS },
	{ name: "Sports-Person", words: SPORTS_PERSONS },
	{ name: "Programming", words: PROGRAMMING },
	{ name: "Household Items", words: HOUSEHOLD },
];
