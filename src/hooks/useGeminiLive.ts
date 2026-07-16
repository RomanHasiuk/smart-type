import { MutableRefObject, useState } from "react";
import { processTextRequest, processAudioRequest } from "../services/geminiService";

export const useGeminiLive = (
  origCursor?: MutableRefObject<number>,
  transCursor?: MutableRefObject<number>,
  targetLanguage: string = "Polish",
  tone: string = "Neutral",
  isQaMode: boolean = false,
  aiModel: "lite" | "pro" = "lite"
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLangCode, setDetectedLangCode] = useState("en-US");

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
      const parsed = await processTextRequest(
        textToProcess,
        targetLanguage,
        tone,
        isQaMode,
        aiModel,
        API_KEY
      );

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
      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(`API Error: ${err.message || err}`);
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
      const parsed = await processAudioRequest(
        audioBlob,
        targetLanguage,
        tone,
        isQaMode,
        aiModel,
        API_KEY
      );

      if (parsed.original) {
        const originalWithSpace = parsed.original + " ";
        setOriginalText((prev) => insertTextAtCursor(prev, originalWithSpace, origCursor));
      }
      if (parsed.translated) {
        setTranslatedText((prev) => insertTextAtCursor(prev, parsed.translated, transCursor));
      }
      if (parsed.languageCode) {
        setDetectedLangCode(parsed.languageCode);
      }
      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(`API Error: ${err.message || err}`);
      setIsProcessing(false);
    }
  };

  const insertTextAtCursor = (prev: string, chunk: string, cursor?: MutableRefObject<number>) => {
    const start = cursor?.current !== undefined ? cursor.current : prev.length;
    let prefix = prev.substring(0, start);
    let suffix = prev.substring(start);
    let chunkToAdd = chunk;

    if (prefix.match(/[\s\n]$/) && chunkToAdd.match(/^[\s\n]/)) {
      chunkToAdd = chunkToAdd.replace(/^[\s\n]+/, "");
    } else if (prefix.length > 0 && !prefix.match(/[\s\n]$/) && !chunkToAdd.match(/^[\s\n]/)) {
      prefix += " ";
    }

    if (chunkToAdd.match(/[\s\n]$/) && suffix.match(/^[\s\n]/)) {
      suffix = suffix.replace(/^[\s\n]+/, "");
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