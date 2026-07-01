import type { HangmanWord } from "./types";

type HintBuilder = (
	word: string,
	categoryName: string,
) => [string, string, string];

export function createCategoryWords(
	words: string[],
	categoryName: string,
	hintBuilder: HintBuilder,
): HangmanWord[] {
	return words.map((word) => ({
		word,
		hints: hintBuilder(word, categoryName),
	}));
}

export function createGenericHints(
	word: string,
	categoryName: string,
): [string, string, string] {
	const cleaned = word.replace(/\s+/g, "");
	const length = cleaned.length;
	const firstLetter = cleaned[0] ?? "A";
	const lastLetter = cleaned[cleaned.length - 1] ?? "A";
	const vowels = (cleaned.match(/[AEIOU]/g) || []).length;
	const normalizedCategory = categoryName.toLowerCase();

	const categoryHint = normalizedCategory.includes("animal")
		? "A living creature"
		: normalizedCategory.includes("fruit")
			? "A sweet edible fruit"
			: normalizedCategory.includes("country")
				? "A country name"
				: normalizedCategory.includes("movie")
					? "A movie title"
					: normalizedCategory.includes("sport")
						? "A sports-related word"
						: normalizedCategory.includes("program")
							? "A coding or tech term"
							: normalizedCategory.includes("house")
								? "A household item"
								: `Related to ${categoryName}`;

	return [
		categoryHint,
		`${length} letters long`,
		`Starts with ${firstLetter}, ends with ${lastLetter}, and has ${vowels} vowels`,
	];
}
