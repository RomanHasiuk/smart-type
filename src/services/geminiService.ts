export interface TranslationResult {
  original: string;
  translated: string;
  languageCode: string;
}

export const parseFlexibleJson = (text: string): TranslationResult => {
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    // Attempt fallback parsing
  }

  let lastBrace = clean.lastIndexOf("}");
  while (lastBrace !== -1) {
    try {
      return JSON.parse(clean.substring(0, lastBrace + 1));
    } catch (e) {
      // Keep checking
    }
    lastBrace = clean.lastIndexOf("}", lastBrace - 1);
  }

  try {
    return JSON.parse(clean + '"}');
  } catch (e) {
    // Attempt fallback
  }
  try {
    return JSON.parse(clean + '"} }');
  } catch (e) {
    // Attempt fallback
  }

  throw new Error("Failed to parse JSON");
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

export const processTextRequest = async (
  textToProcess: string,
  targetLanguage: string,
  tone: string,
  isQaMode: boolean,
  aiModel: "lite" | "pro",
  apiKey: string
): Promise<TranslationResult> => {
  const modelName = aiModel === "pro" ? "gemini-3.5-flash" : "gemini-3.1-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const standardPrompt = `You are a professional translator and editor.
You will be provided with a text.
Your goal is to perform two tasks and return the result in JSON format:
1. "original": Perfectly format and correct the text (remove filler words like 'umm', 'uh', unnecessary pauses, fix minor errors, and add proper punctuation), while keeping the original language. This text MUST remain in a strictly NEUTRAL tone (do not change the style or add any new words).
2. "translated": Translate this text into the target language: ${targetLanguage}. You MUST apply the following tone/style to the translated text: ${tone}.
3. "languageCode": Determine the standard language code (e.g., "uk-UA", "en-US", "pl-PL", "de-DE") for the target language (${targetLanguage}).

Return ONLY valid JSON in this format:
{
  "original": "...",
  "translated": "...",
  "languageCode": "en-US"
}`;

  const qaPrompt = `You are a knowledgeable AI assistant.
You will be provided with a text representing a question or prompt.
Your goal is to perform two tasks and return the result in JSON format:
1. "original": Format and correct the user's question/prompt for grammar and clarity, keeping its original language.
2. "translated": ANSWER the question or fulfill the prompt in the target language (${targetLanguage}). You MUST apply the following tone/style to your answer: ${tone}. Do NOT just translate the question; provide the actual ANSWER.
3. "languageCode": Determine the standard language code (e.g., "uk-UA", "en-US", "pl-PL", "de-DE") for the target language (${targetLanguage}).

Return ONLY valid JSON in this format:
{
  "original": "...",
  "translated": "...",
  "languageCode": "en-US"
}`;

  const systemPrompt = isQaMode ? qaPrompt : standardPrompt;

  const payload = {
    contents: [
      {
        parts: [
          { text: "Here is my text. Please process it:\n\n" + textToProcess },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${response.status} Error`);
  }

  if (data.candidates && data.candidates[0].content.parts[0].text) {
    const jsonText = data.candidates[0].content.parts[0].text;
    return parseFlexibleJson(jsonText);
  }

  throw new Error("Empty response from AI");
};

export const processAudioRequest = async (
  audioBlob: Blob,
  targetLanguage: string,
  tone: string,
  isQaMode: boolean,
  aiModel: "lite" | "pro",
  apiKey: string
): Promise<TranslationResult> => {
  const base64data = await blobToBase64(audioBlob);
  const modelName = aiModel === "pro" ? "gemini-3.5-flash" : "gemini-3.1-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const standardAudioPrompt = `You are a professional translator and editor. 
You will be provided with an audio recording.
Your goal is to perform two tasks and return the result in JSON format:
1. "original": Transcribe the original language, perfectly format the text (remove filler words, unnecessary pauses, fix minor errors, and add proper punctuation). This text MUST remain in a strictly NEUTRAL tone (do not change the style or add any new words).
2. "translated": Translate this text into the target language: ${targetLanguage}. You MUST apply the following tone/style to the translated text: ${tone}.
3. "languageCode": Determine the standard language code (e.g., "uk-UA", "en-US", "pl-PL", "de-DE") for the target language (${targetLanguage}).

Return ONLY valid JSON in this format:
{
  "original": "...",
  "translated": "...",
  "languageCode": "en-US"
}`;

  const qaAudioPrompt = `You are a knowledgeable AI assistant.
You will be provided with an audio recording representing a question or prompt.
Your goal is to perform two tasks and return the result in JSON format:
1. "original": Transcribe, format, and correct the user's question/prompt, keeping its original language.
2. "translated": ANSWER the question or fulfill the prompt in the target language (${targetLanguage}). You MUST apply the following tone/style to your answer: ${tone}. Do NOT just translate the question; provide the actual ANSWER.
3. "languageCode": Determine the standard language code (e.g., "uk-UA", "en-US", "pl-PL", "de-DE") for the target language (${targetLanguage}).

Return ONLY valid JSON in this format:
{
  "original": "...",
  "translated": "...",
  "languageCode": "en-US"
}`;

  const systemPrompt = isQaMode ? qaAudioPrompt : standardAudioPrompt;

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
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${response.status} Error`);
  }

  if (data.candidates && data.candidates[0].content.parts[0].text) {
    const jsonText = data.candidates[0].content.parts[0].text;
    return parseFlexibleJson(jsonText);
  }

  throw new Error("Empty response from AI");
};
