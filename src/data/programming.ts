import { createCategoryWords, createGenericHints } from "./categoryFactory";

const PROGRAMMING_WORDS = [
	"JAVASCRIPT",
	"TYPESCRIPT",
	"ALGORITHM",
	"COMPILER",
	"FUNCTION",
	"VARIABLE",
	"REACTJS",
	"NODEJS",
	"ASYNCHRONOUS",
	"INTERPRETER",
	"DATABASE",
	"FRAMEWORK",
	"COMPONENT",
	"STYLESHEET",
	"POLYMORPHISM",
	"ENCAPSULATION",
	"INHERITANCE",
	"DEVELOPER",
	"SOFTWARE",
	"DEBUGGING",
	"BINARY",
	"NETWORK",
	"PACKAGE",
	"OBJECT",
	"ARRAY",
	"FUNCTIONAL",
	"RECURSION",
	"LOOP",
	"BOOLEAN",
	"VARIABLES",
];

export const PROGRAMMING = createCategoryWords(
	PROGRAMMING_WORDS,
	"Programming",
	(word) => {
		const manualHints: Record<string, [string, string, string]> = {
			JAVASCRIPT: [
				"A popular front-end scripting language",
				"Runs in browsers and Node.js",
				"Often used with React",
			],
			TYPESCRIPT: [
				"A typed superset of JavaScript",
				"Helpful for safer code",
				"Used widely in modern apps",
			],
			DATABASE: [
				"Stores application data",
				"Often queried with SQL",
				"Can be relational or NoSQL",
			],
			REACTJS: [
				"A UI library for building interfaces",
				"Built around components",
				"Often paired with Vite",
			],
		};

		return manualHints[word] ?? createGenericHints(word, "Programming");
	},
);
