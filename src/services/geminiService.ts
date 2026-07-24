import { getModelPair } from "../config";

export interface TranslationResult {
  original: string;
  translated: string;
  languageCode: string;
}

export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    original: {
      type: "STRING",
      description: "Cleaned and formatted original text",
    },
    translated: {
      type: "STRING",
      description: "Processed text, translation, or answer in the requested tone",
    },
    languageCode: {
      type: "STRING",
      description: "Standard language code (e.g. en-US, uk-UA, pl-PL)",
    },
  },
  required: ["original", "translated", "languageCode"],
};

export const hasEmojiTrigger = (tone: string): boolean => {
  if (!tone) return false;
  const containsKeyword = /emoji|expressive/i.test(tone);
  const containsPictographic = /\p{Extended_Pictographic}/u.test(tone);
  return containsKeyword || containsPictographic;
};

export const resolveTone = (tone: string): string => {
  if (tone === "Bug Fix & Refactoring Assistant") {
    return `You are a Principal Software Engineer and Security/Code Auditor.
Your goal is to analyze broken code or error tracebacks provided by the user.
STRICT FORMATTING RULES:
1. NO GREETINGS OR CONVERSATIONAL FILLER.
2. Provide a 1-sentence explanation of the root cause under a heading "### 🔍 Bug Cause".
3. Provide the clean, production-ready, strictly-typed refactored code block under "### 🛠️ Fixed Code".
4. List 2 key bullet points explaining why the fix works under "### 💡 Why It Works".`;
  }
  if (tone === "Architecture Decision Record (ADR)") {
    return `You are a Principal Systems Architect.
Transform the user's unstructured voice thoughts or notes into a formal Architecture Decision Record (ADR).
STRICT STRUCTURE:
# ADR: [Short Title]
## 1. Context & Problem Statement
## 2. Decision Outcome & Architecture
## 3. Trade-Offs & Consequences (Pros & Cons)`;
  }
  if (tone === "Silicon Valley Native English Refiner") {
    return `You are an elite Silicon Valley Tech Lead and Native English Editor.
Transform the user's input (whether spoken in rough English, Ukrainian, or mixed IT slang) into articulate, professional, native-level Silicon Valley Tech English.
REQUIREMENTS:
- Make it sound natural for PR reviews, Jira tickets, Slack discussions, or executive emails.
- Preserve all technical terms and exact intent without over-formalizing into outdated dictionary phrasing.`;
  }
  if (tone === "CLI Command & Regex Wizard") {
    return `You are a DevOps and Terminal Automation Architect.
Transform the user's request into exact, working CLI terminal commands (PowerShell, Bash, Git CLI, Docker, SQL) or regular expressions (Regex).
STRICT RULES:
1. When chaining multiple commands together, ALWAYS use the "&&" operator (e.g. "git checkout main && git pull origin main") so commands only execute if the previous one succeeded. Do NOT use semicolons ";".
2. Provide the exact executable single-line command first.
3. Follow with a short bullet breakdown of the flags and key parts used.`;
  }
  if (tone === "Executive Summary & Action Items") {
    return `You are an Executive Technical Project Manager.
Transform the voice recording, notes, or discussion into a structured summary.
STRICT STRUCTURE:
- 🎯 Main Goal / Theme
- 📌 Key Decisions Made
- ✅ Actionable TODO List (with clear next steps)`;
  }
  if (tone === "Phonetic Transliteration") {
    return `Phonetic Transliteration Mode:
Perform the translation using a strict two-step pipeline:
1. Translate the entire source sentence fully and accurately into the target language.
2. Convert that exact translated sentence phonetically into the UKRAINIAN Cyrillic script.
CRITICAL ALPHABET RULE: Use strictly UKRAINIAN Cyrillic letters (e.g., 'е', 'є', 'и', 'і', 'ї'). Do NOT use Russian letters like 'э', 'ы', 'ъ'. (Example: write 'вомень' NOT 'вомэнь').

STRICT TWO-LINE FORMAT FOR THE TRANSLATED FIELD (NO SQUARE BRACKETS):
Line 1: Standard translation in target language script (e.g. "My house is your house." or "你好")
Line 2: Exact phonetic transliteration of Line 1 in UKRAINIAN Cyrillic script (e.g. "Май хаус із йор хаус." or "Сяньцзай вомень лай цзяньча ися чжунвень.")`;
  }
  if (tone === "Lite IT Slang") {
    return "Lite IT Slang (write in a natural, neutral tone. Keep and preserve common IT jargon, technical slang, and anglicisms if they are present in the source text, without translating them to overly formal dictionary words of the target language. For example, if translating to Ukrainian/Polish, keep terms like build/deploy/fix/screenshot transliterated naturally, but do NOT inject new slang if it wasn't in the original text.)";
  }
  if (tone === "Nano Banana Image Prompt") {
    return `You are Prompt Engineer, a master-architect of prompts with deep expertise in designing system instructions for AI agents and AI image generators like Nano Banana.
Your goal is to build a highly detailed image generation prompt based on the user's input.
You MUST strictly follow this master template structure:

Subject/Object: ...
Style: ...
Color Palette: ...
Texture/Material: ...
Camera Angle: ...
Lighting: ...
Technical Details: ...

CRITICAL FORMATTING RULES:
1. Write each attribute on a new line.
2. Do NOT wrap label names in square brackets [...] (e.g. write "Subject/Object: ..." NOT "[Subject/Object] ...").
3. Suggest your best creative ideas filling in all attributes of the template.
4. Always generate the prompt attributes in English, as image generation models perform best with English descriptions.`;
  }
  if (tone === "IT Interview Answer (with Code Examples)") {
    return `You are a Senior Technical Lead and Architect preparing a candidate for a top-tier IT technical interview across any technology domain (Frontend, Backend, DevOps, Git/GitHub, Cloud, Databases, Security, System Design).
Your goal is to answer the user's technical question at a Senior level.

STRICT FORMATTING & TONE RULES:
1. NO INTRODUCTORY FLUFF OR GREETINGS. Do NOT start with "Hello", "Sure!", "Certainly", or "Thanks for asking". Jump directly into the structured answer.
2. Provide a concise, high-level conceptual explanation of the topic.
3. Highlight key architectural principles, performance implications, security aspects, or trade-offs.
4. Include a practical, production-ready code snippet, CLI command, config file (YAML/JSON/Bash/Docker/Git/TypeScript/Python/SQL/etc.), or concrete technical example.
5. Format with clear markdown headings, bullet points, and syntax-highlighted code blocks.`;
  }
  if (tone === "StackOverflow Answer") {
    return `You are a top-ranked StackOverflow contributor answering a technical question.
STRICT RULES FOR YOUR ANSWER:
1. NO GREETINGS OR CONVERSATIONAL FILLER. Do NOT say "Hello", "Here is the solution", or "Hope this helps".
2. Start DIRECTLY with the concise, working code, CLI command, config, or solution block (TL;DR Solution).
3. Follow with a brief, bulleted explanation of why it works and key technical details.
4. If applicable, add a short "Note:" highlighting edge cases, performance tips, or common pitfalls.`;
  }
  return tone;
};

export const buildSystemPrompt = (
  isAudio: boolean,
  isQaMode: boolean,
  targetLanguage: string,
  tone: string
): string => {
  const resolvedTone = resolveTone(tone);
  const emojiEnabled = hasEmojiTrigger(tone);

  const mediaType = isAudio ? "an audio recording" : "a text";
  const emojiRule = (isAudio && emojiEnabled)
    ? "\n4. EXPRESSIVE EMOJI RULE: The user selected an emotional/emoji tone. Listen to the voice tone and audio cues carefully. If laughter, giggling, crying, anger, excitement, or strong emotion is detected in the audio, insert appropriate matching Unicode emojis reflecting the exact emotion into the translated text. Do NOT spam or over-use emojis (use at most 1-2 subtle, natural emojis per response matching key emotional moments)."
    : "";

  const langDisambiguation = `CRITICAL LANGUAGE DISAMBIGUATION RULES:
If the input is spoken or typed in Ukrainian, process it strictly using standard Ukrainian alphabet characters (і, ї, є, ґ). NEVER confuse Ukrainian speech/text with Russian or output Russian letters.`;

  if (isQaMode) {
    return `You are a knowledgeable AI assistant.
You will be provided with ${mediaType} representing a question or prompt.
${langDisambiguation}
Your goal is to perform tasks and return the result strictly in JSON format:
1. "original": Format and correct the user's question/prompt for grammar and clarity, removing filler words like 'umm', 'uh', stuttering, or unnecessary pauses, keeping its original language intact.
2. "translated": ANSWER the question or fulfill the prompt in the target language (${targetLanguage}). You MUST apply the following tone/style to your answer: ${resolvedTone}. Do NOT just translate the question; provide the actual ANSWER.${emojiRule}
3. "languageCode": Determine the standard language code (e.g., "uk-UA", "en-US", "pl-PL", "de-DE") for the target language (${targetLanguage}).`;
  }

  return `You are a professional translator and editor.
You will be provided with ${mediaType}.
${langDisambiguation}
Your goal is to perform two tasks and return the result strictly in JSON format:
1. "original": Perfectly format and correct the text (remove filler words like 'umm', 'uh', stuttering, unnecessary pauses, fix minor errors, and add proper punctuation), while keeping the original language intact. This text MUST remain in a strictly NEUTRAL tone.
2. "translated": Translate this text into the target language: ${targetLanguage}. You MUST apply the following tone/style to the translated text: ${resolvedTone}.${emojiRule}
3. "languageCode": Determine the standard language code (e.g., "uk-UA", "en-US", "pl-PL", "de-DE") for the target language (${targetLanguage}).`;
};

export const parseFlexibleJson = (text: string): TranslationResult => {
  const clean = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    let lastBrace = clean.lastIndexOf("}");
    while (lastBrace !== -1) {
      try {
        return JSON.parse(clean.substring(0, lastBrace + 1));
      } catch (err) {
        // Continue checking
      }
      lastBrace = clean.lastIndexOf("}", lastBrace - 1);
    }
    throw new Error(`Failed to parse JSON response: ${text.slice(0, 100)}...`);
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getGeminiUrl = (modelName: string, apiKey: string): string => {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
};

const makeGeminiRequest = async (
  url: string,
  payload: any,
  retries: number = 3,
  timeoutMs: number = 60000
): Promise<TranslationResult> => {
  const modelMatch = url.match(/models\/([^:]+)/);
  const modelName = modelMatch ? modelMatch[1] : "gemini";

  console.log(`  🌐 [API Network] Sending POST request to ${modelName}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || `HTTP ${response.status} Error`;

      if ((response.status === 503 || response.status === 429) && retries > 0) {
        console.warn(`  ⚠️ [API Network] Model ${modelName} returned HTTP ${response.status} (High demand). Retrying in 1s...`);
        await new Promise((r) => setTimeout(r, 1000));
        return makeGeminiRequest(url, payload, retries - 1, timeoutMs);
      }

      throw new Error(errorMsg);
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const jsonText = data.candidates[0].content.parts[0].text;
      return parseFlexibleJson(jsonText);
    }

    throw new Error("Empty response from AI");
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Таймаут мережевого запиту (${timeoutMs / 1000} сек) для моделі ${modelName}`);
    }
    throw err;
  }
};

export const processTextRequest = async (
  textToProcess: string,
  targetLanguage: string,
  tone: string,
  isQaMode: boolean,
  aiModel: string,
  apiKey: string
): Promise<TranslationResult> => {
  const { proModelId } = getModelPair(aiModel);

  console.log(`🤖 [SmartType Web] Text processing model: ${proModelId}`);
  const url = getGeminiUrl(proModelId, apiKey);
  const systemPrompt = buildSystemPrompt(false, isQaMode, targetLanguage, tone);

  const payload = {
    contents: [
      {
        parts: [{ text: "Here is my text. Please process it:\n\n" + textToProcess }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  };

  return makeGeminiRequest(url, payload);
};

export const processAudioRequest = async (
  audioBlob: Blob,
  targetLanguage: string,
  tone: string,
  isQaMode: boolean,
  aiModel: string,
  apiKey: string,
  onSttComplete?: (sttResult: TranslationResult) => void
): Promise<TranslationResult> => {
  const base64data = await blobToBase64(audioBlob);
  const { sttModelId, proModelId, isLiteOnly } = getModelPair(aiModel);

  console.log(`🎙️ [SmartType Web] Audio dictation initiated (Model Pair: STT=${sttModelId}, Pro=${proModelId})`);

  if (!isLiteOnly) {
    console.log(`  ├─ ⚡ Stage 1 (STT): Transcribing audio using ${sttModelId}...`);
    const liteUrl = getGeminiUrl(sttModelId, apiKey);
    const sttPrompt = `You are an expert speech-to-text transcriber with deep proficiency in Ukrainian, English, and global languages.
You will be provided with an audio recording.
CRITICAL LANGUAGE DISAMBIGUATION RULES:
1. ACCURATELY detect the exact language spoken. If the audio is spoken in Ukrainian, transcribe it strictly in Ukrainian using standard Ukrainian alphabet characters (і, ї, є, ґ). NEVER confuse Ukrainian speech with Russian or output Russian letters.
2. Transcribe the audio faithfully, format the text cleanly (remove filler words like 'umm', 'uh', unnecessary pauses, fix minor errors, add proper punctuation), preserving the exact spoken language.
3. Return JSON with:
   - "original": the transcribed text in neutral tone.
   - "translated": the transcribed text in neutral tone.
   - "languageCode": the detected standard language code (e.g. "uk-UA", "en-US").`;

    const sttPayload = {
      contents: [
        {
          parts: [
            { text: "Transcribe this audio:" },
            {
              inlineData: {
                mimeType: audioBlob.type || "audio/webm",
                data: base64data,
              },
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: sttPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_RESPONSE_SCHEMA,
      },
    };

    const sttResult = await makeGeminiRequest(liteUrl, sttPayload);

    if (sttResult.original && onSttComplete) {
      onSttComplete(sttResult);
    }

    if (sttResult.original) {
      console.log(`  └─ 🤖 Stage 2 (Pro Response): Processing text using ${proModelId}...`);
      try {
        const proResult = await processTextRequest(
          sttResult.original,
          targetLanguage,
          tone,
          isQaMode,
          proModelId,
          apiKey
        );

        return {
          original: sttResult.original,
          translated: proResult.translated,
          languageCode: proResult.languageCode || sttResult.languageCode,
        };
      } catch (err: any) {
        console.warn(`  ⚠️ Stage 2 (Pro Model ${proModelId}) failed: ${err.message || err}. Falling back to ${sttModelId}...`);
        
        try {
          const fallbackResult = await processTextRequest(
            sttResult.original,
            targetLanguage,
            tone,
            isQaMode,
            sttModelId,
            apiKey
          );

          const warningPrefix = `[⚠️ Pro model (${proModelId}) is unavailable. Response generated using Lite model (${sttModelId})]:\n\n`;

          return {
            original: sttResult.original,
            translated: warningPrefix + fallbackResult.translated,
            languageCode: fallbackResult.languageCode || sttResult.languageCode,
          };
        } catch (fallbackErr: any) {
          console.error("  ❌ Stage 2 Fallback also failed:", fallbackErr);
          return {
            original: sttResult.original,
            translated: `[⚠️ Connection error with Pro model (${proModelId}). Recognized text preserved in Column 1. You can click Sparkles ✨ button to re-process.]`,
            languageCode: sttResult.languageCode,
          };
        }
      }
    }

    return sttResult;
  }

  const url = getGeminiUrl(sttModelId, apiKey);
  const systemPrompt = buildSystemPrompt(true, isQaMode, targetLanguage, tone);

  const payload = {
    contents: [
      {
        parts: [
          { text: "Here is my audio. Please process it." },
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/webm",
              data: base64data,
            },
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  };

  const liteResult = await makeGeminiRequest(url, payload);

  if (liteResult.original && onSttComplete) {
    onSttComplete(liteResult);
  }

  return liteResult;
};
