import { MutableRefObject, useState } from "react";

export const useGeminiLive = (
  origCursor?: MutableRefObject<number>,
  transCursor?: MutableRefObject<number>,
  targetLanguage: string = "Polish",
  tone: string = "Neutral"
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLangCode, setDetectedLangCode] = useState("en-US");

  const parseFlexibleJson = (text: string) => {
    let clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try { return JSON.parse(clean); } catch (e) {}
    
    let lastBrace = clean.lastIndexOf('}');
    while (lastBrace !== -1) {
      try { return JSON.parse(clean.substring(0, lastBrace + 1)); } catch (e) {}
      lastBrace = clean.lastIndexOf('}', lastBrace - 1);
    }
    
    try { return JSON.parse(clean + '"}'); } catch (e) {}
    try { return JSON.parse(clean + '"} }'); } catch (e) {}
    
    throw new Error("Failed to parse JSON");
  };

  const processText = async (textToProcess: string) => {
    setIsProcessing(true);
    setError(null);
    let API_KEY = localStorage.getItem("gemini_api_key");
    if (API_KEY) API_KEY = API_KEY.trim();

    if (!API_KEY) {
      setError("Please enter your Gemini API Key in the settings.");
      setIsProcessing(false);
      return;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
      
      const systemPrompt = `You are a professional translator and editor.
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

      const payload = {
        contents: [{
          parts: [
            { text: "Here is my text. Please process it:\n\n" + textToProcess }
          ]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        try {
          const parsed = parseFlexibleJson(jsonText);
          
          if (parsed.original) {
            setOriginalText(parsed.original);
            if (origCursor) origCursor.current = parsed.original.length;
          }
          if (parsed.translated) {
            setTranslatedText(parsed.translated);
            if (transCursor) transCursor.current = parsed.translated.length;
          }
          if (parsed.languageCode) {
            setDetectedLangCode(parsed.languageCode);
          }
        } catch (e) {
          console.error("Failed to parse JSON:", jsonText);
          setError("AI text formatting error");
        }
      } else {
          console.error("API Error:", data);
          setError(`API Error: ${data.error?.message || 'Empty response'}`);
      }
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setError("Error while processing text");
      setIsProcessing(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    let API_KEY = localStorage.getItem("gemini_api_key");
    if (API_KEY) API_KEY = API_KEY.trim();

    if (!API_KEY) {
      setError("Please enter your Gemini API Key in the settings.");
      setIsProcessing(false);
      return;
    }

    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];

        // Request to the lightweight Gemini 3.1 Flash-Lite model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        const systemPrompt = `You are a professional translator and editor. 
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

        const payload = {
          contents: [{
            parts: [
              { text: "Here is my audio. Please process it." },
              {
                inlineData: {
                  mimeType: audioBlob.type || "audio/webm",
                  data: base64data
                }
              }
            ]
          }],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const jsonText = data.candidates[0].content.parts[0].text;
          try {
            const parsed = parseFlexibleJson(jsonText);
            
            if (parsed.original) {
              setOriginalText(prev => insertTextAtCursor(prev, parsed.original, origCursor));
            }
            if (parsed.translated) {
              setTranslatedText(prev => insertTextAtCursor(prev, parsed.translated, transCursor));
            }
            if (parsed.languageCode) {
              setDetectedLangCode(parsed.languageCode);
            }
          } catch (e) {
            console.error("Failed to parse JSON:", jsonText);
            setError("AI text formatting error");
          }
        } else {
            console.error("API Error:", data);
            setError(`API Error: ${data.error?.message || 'Empty response'}`);
        }
        setIsProcessing(false);
      };
    } catch (err) {
      console.error(err);
      setError("Error while processing audio");
      setIsProcessing(false);
    }
  };

  const insertTextAtCursor = (prev: string, chunk: string, cursor?: MutableRefObject<number>) => {
    const start = cursor?.current !== undefined ? cursor.current : prev.length;
    let prefix = prev.substring(0, start);
    let suffix = prev.substring(start);
    let chunkToAdd = chunk;

    if (prefix.match(/[\s\n]$/) && chunkToAdd.match(/^[\s\n]/)) {
      chunkToAdd = chunkToAdd.replace(/^[\s\n]+/, '');
    } else if (prefix.length > 0 && !prefix.match(/[\s\n]$/) && !chunkToAdd.match(/^[\s\n]/)) {
      prefix += " ";
    }
    
    if (chunkToAdd.match(/[\s\n]$/) && suffix.match(/^[\s\n]/)) {
      suffix = suffix.replace(/^[\s\n]+/, '');
    } else if (suffix.length > 0 && !suffix.match(/^[\s\n.,!?:]/) && !chunkToAdd.match(/[\s\n]$/)) {
      chunkToAdd += " ";
    }
    
    const newText = prefix + chunkToAdd + suffix;
    if (cursor) {
      cursor.current = prefix.length + chunkToAdd.length;
    }
    return newText;
  };

  return {
    isProcessing,
    error,
    originalText,
    setOriginalText,
    translatedText,
    setTranslatedText,
    detectedLangCode,
    processAudio,
    processText,
  };
};