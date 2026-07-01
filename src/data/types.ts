export type HangmanWord = {
	word: string;
	hints: [string, string, string];
	difficulty?: "easy" | "medium" | "hard";
};

export type HangmanCategoryRaw = {
	name: string;
	words: HangmanWord[];
};
