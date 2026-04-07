import { DICTIONARY } from "../data/dictionary";

export function generateLevel(letters: string[]) {
	const results: string[] = [];

	for (const word of DICTIONARY) {
		if (canBuild(word, letters)) {
			results.push(word);
		}
	}

	if (results.length === 0) {
		console.warn("No words found for letters:", letters);
		return [];
	}

	// sort by length
	results.sort((a, b) => a.length - b.length);

	// remove duplicates
	const unique = [...new Set(results)];

	return unique.slice(0, 6);
}

function canBuild(word: string, letters: string[]) {
	const pool = [...letters];

	for (const l of word) {
		const index = pool.indexOf(l);

		if (index === -1) return false;

		pool.splice(index, 1);
	}

	return true;
}
