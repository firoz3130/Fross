import { createCategoryWords, createGenericHints } from "./categoryFactory";

const COUNTRIES_WORDS = [
	"AUSTRALIA",
	"BRAZIL",
	"CANADA",
	"DENMARK",
	"EGYPT",
	"FRANCE",
	"GERMANY",
	"HUNGARY",
	"ICELAND",
	"JAPAN",
	"KENYA",
	"LEBANON",
	"MEXICO",
	"NIGERIA",
	"PORTUGAL",
	"QATAR",
	"ROMANIA",
	"SPAIN",
	"THAILAND",
	"UGANDA",
	"VIETNAM",
	"YEMEN",
	"ZAMBIA",
	"BELGIUM",
	"CHILE",
	"FINLAND",
	"GREECE",
	"IRELAND",
	"JORDAN",
	"MALAYSIA",
];

export const COUNTRIES = createCategoryWords(
	COUNTRIES_WORDS,
	"Countries",
	(word) => {
		const manualHints: Record<string, [string, string, string]> = {
			AUSTRALIA: [
				"A country in Oceania",
				"Known for the Sydney Opera House",
				"Home to kangaroos",
			],
			BRAZIL: [
				"A country in South America",
				"Known for the Amazon rainforest",
				"Hosts the Carnival festival",
			],
			JAPAN: [
				"An island nation in Asia",
				"Known for sushi and cherry blossoms",
				"Home to Tokyo",
			],
			EGYPT: [
				"A country in North Africa",
				"Known for the Nile River",
				"Home to the pyramids",
			],
		};

		return manualHints[word] ?? createGenericHints(word, "Countries");
	},
);
