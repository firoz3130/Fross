import { createCategoryWords, createGenericHints } from "./categoryFactory";

const SPORTS_WORDS = [
	"RONALDO",
	"MESSI",
	"MBAPPE",
	"NEYMAR",
	"KOHLI",
	"DHONI",
	"BASKETBALL",
	"FOOTBALL",
	"CRICKET",
	"VOLLEYBALL",
	"BADMINTON",
	"SWIMMING",
	"BASEBALL",
	"BOXING",
	"FENCING",
	"SKATEBOARD",
	"SURFING",
	"SNOWBOARD",
	"TABLETENNIS",
	"HOCKEY",
	"RUGBY",
	"ATHLETICS",
	"GYMNASTICS",
	"CURLING",
	"ARCHERY",
	"ROWING",
	"FREESTYLE",
	"MARATHON",
	"HANDBALL",
	"SQUASH",
	"WRESTLING",
	"SKIING",
	"DIVING",
	"KARATE",
	"TABLETOP",
	"LACROSSE",
];

export const SPORTS = createCategoryWords(SPORTS_WORDS, "Sports", (word) => {
	const manualHints: Record<string, [string, string, string]> = {
		FOOTBALL: [
			"A team sport played with a ball",
			"Popular in Europe and South America",
			"Often called soccer in some regions",
		],
		CRICKET: [
			"A bat-and-ball sport",
			"Popular in India and England",
			"Involves wickets and overs",
		],
		BASKETBALL: [
			"A fast-paced court sport",
			"Played with a hoop and ball",
			"Known for slam dunks",
		],
		SWIMMING: [
			"A water-based sport",
			"Requires speed and stamina",
			"Often held in pools or open water",
		],
	};

	return manualHints[word] ?? createGenericHints(word, "Sports");
});
