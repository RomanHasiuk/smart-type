export const LANGUAGES = [
  "Ukrainian",
  "English",
  "Polish",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Chinese",
  "Korean",
  "Arabic",
  "Japanese",
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "C++",
  "Java",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin"
];

export const TONES = [
  "Neutral",
  "Lite IT Slang",
  "Professional",
  "Casual",
  "Friendly",
  "Slang",
  "Concise",
  "Discord",
  "Senior Developer",
  "Code Reviewer",
  "Prompt Engineering",
  "Nano Banana Image Prompt",
  "Git Commit Message",
  "StackOverflow Answer",
  "Technical Writer",
  "Markdown",
  "Formal Letter with Greeting & Signature",
  "IT Interview Answer (with Code Examples)",
  "Newspaper Report Style",
  "IT Jargon & Tech Slang",
  "Phonetic Transliteration",
  "Aggressive",
  "Obnoxious",
  "Sarcastic",
  "Poetic",
  "Shakespearean",
  "Romantic",
  "Funny",
  "Romantic Novel",
  "Fantasy Wizard",
  "Cyberpunk AI",
  "Horror Story",
  "Detective Noir",
  "Pirate Captain",
  "Viking Warrior",
];

export interface AIModelOption {
  id: string;
  label: string;
  type: "lite" | "pro";
}

export const AI_MODELS: AIModelOption[] = [
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", type: "lite" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite", type: "lite" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", type: "pro" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash (STT: 3.5 Lite)", type: "pro" },
  { id: "gemini-3.6-flash-stt31", label: "Gemini 3.6 Flash (STT: 3.1 Lite)", type: "pro" },
];

export const DEFAULT_LANGUAGE = "Ukrainian";
export const DEFAULT_THEME = "system";
export const DEFAULT_MODEL = "gemini-3.1-flash-lite";
