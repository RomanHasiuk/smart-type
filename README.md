# 🌐 Smart Type Web Application

Fast, modern web-based AI dictation and text transformation suite powered by React, Vite, TypeScript, and Google Gemini API (3.6 Flash / 3.5 Flash / 3.1 Flash Lite).

🌐 **Live Web Application:** [https://smart-type-five.vercel.app/](https://smart-type-five.vercel.app/)  
📖 **User Guide:** [USER_GUIDE.md](USER_GUIDE.md)

---

## 🎯 Custom Tones & Prompts Suite

Smart Type includes a curated suite of specialized AI system instructions for developer productivity, software engineering, and prompt design:

| № | Tone Name | Purpose & Output Format |
|---|---|---|
| 1 | **`Bug Fix & Refactoring Assistant`** | **Code Remediation & Diagnosis**. Accepts broken code or runtime error logs. Returns:<br>• `### 🔍 Bug Cause`: 1-sentence root cause.<br>• `### 🛠️ Fixed Code`: Clean, production-ready, strictly typed refactored code.<br>• `### 💡 Why It Works`: 2 bullet points explaining the fix. |
| 2 | **`Architecture Decision Record (ADR)`** | **Technical Specification Generator**. Converts unstructured voice notes into a formal Architecture Decision Record:<br>• `# ADR: Title`<br>• `## 1. Context & Problem Statement`<br>• `## 2. Decision Outcome & Architecture`<br>• `## 3. Trade-Offs & Consequences (Pros & Cons)` |
| 3 | **`Silicon Valley Native English Refiner`** | **Professional Tech English Editor**. Refines voice dictation or text into articulate, native-level Silicon Valley engineering English suitable for PR reviews, Jira tickets, and Slack discussions. |
| 4 | **`CLI Command & Regex Wizard`** | **Terminal Command Generator**. Converts natural language requests into exact, working **PowerShell / Bash / Git CLI / Docker** commands or Regular Expressions with flag breakdowns. |
| 5 | **`Executive Summary & Action Items`** | **Meeting Notes Summarizer**. Converts audio memos into executive summaries:<br>• `🎯 Main Goal`<br>• `📌 Key Decisions Made`<br>• `✅ Actionable TODO List` |
| 6 | **`IT Interview Answer (with Code Examples)`** | **Senior Tech Interview Prep**. Answers technical prompts across any domain (Frontend, Backend, DevOps, DB, System Design) directly without conversational fluff, including code examples and trade-offs. |
| 7 | **`StackOverflow Answer`** | **Top StackOverflow Contributor Format**. Starts directly with working code (TL;DR Solution), followed by `Why it works` points and edge case warnings. |
| 8 | **`Nano Banana Image Prompt`** | **AI Image Generation Prompt Architect**. Formats English prompts line-by-line (`Subject/Object`, `Style`, `Color Palette`, `Texture/Material`, `Camera Angle`, `Lighting`, `Technical Details`) without square brackets `[...]`. |
| 9 | **`Phonetic Transliteration`** | **Phonetic Script Translator**. Uses strict 2-step pipeline with Ukrainian Cyrillic alphabet (no Russian letters like э, ы, ъ):<br>• Line 1: Standard translation in target script.<br>• Line 2: Full phonetic transliteration in Ukrainian Cyrillic. |
| 10 | **`Lite IT Slang`** | **Natural Tech Jargon Preservation**. Translates text naturally while preserving common engineering slang (fix, deploy, build, screenshot). |
| 11 | **`Expressive Emoji Trigger`** | **Voice Emotion & Laughter Detection**. Activated dynamically when any tone includes an emoji icon (e.g. `Casual 🙂`, `Friendly 👍`, `Lite IT Slang ❤️`) or keyword `Emoji`. Gemini listens to voice tone and automatically inserts appropriate emojis (`😂`, `😅`, `🤔`, `😮`) upon detecting laughter or strong emotion. |

---

## ⚡ Models & Hybrid Audio Pipeline

- **`Gemini 3.1 Flash Lite`** — Ultra-fast single-pass dictation (~400ms latency).
- **`Gemini 3.5 Flash Lite`** — High-accuracy single-pass dictation.
- **`Gemini 3.5 Flash`** — Two-stage pipeline (STT: `3.1 Lite` $\rightarrow$ Pro: `3.5 Flash`).
- **`Gemini 3.6 Flash (STT: 3.5 Lite)`** — Two-stage pipeline (STT: `3.5 Lite` $\rightarrow$ Pro: `3.6 Flash`).
- **`Gemini 3.6 Flash (STT: 3.1 Lite)`** — Two-stage pipeline (STT: `3.1 Lite` $\rightarrow$ Pro: `3.6 Flash`).

---

## 🛡️ Reliability & Resilience

- **60s AbortController Network Timeout** for handling long audio dictations (up to 3 minutes).
- **Automatic Retries (3 attempts)** for HTTP 503 / 429 High Demand server states.
- **Structured JSON Output (`responseSchema`)** ensuring 100% parse safety.
