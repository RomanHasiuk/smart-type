import { useState, useEffect } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceWarningLang, setVoiceWarningLang] = useState<string | null>(null);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const closeVoiceWarning = () => {
    setVoiceWarningLang(null);
  };

  const speak = (text: string, targetLanguage: string, detectedLangCode: string) => {
    if (!("speechSynthesis" in window)) {
      setVoiceWarningLang("Web Speech API not supported");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const langMap: Record<string, string> = {
      ukrainian: "uk-UA",
      english: "en-US",
      polish: "pl-PL",
      spanish: "es-ES",
      german: "de-DE",
      italian: "it-IT",
      french: "fr-FR",
      chinese: "zh-CN",
      korean: "ko-KR",
    };
    const normalizedTarget = targetLanguage.toLowerCase().trim();
    const finalLangCode = langMap[normalizedTarget] || detectedLangCode || "en-US";

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = finalLangCode.split("-")[0].toLowerCase();

    let matchedVoice = voices.find((v) => {
      const isMatch = v.lang.toLowerCase().startsWith(langPrefix);
      if (langPrefix !== "de" && v.name.toLowerCase().includes("german")) return false;
      return isMatch;
    });

    if (!matchedVoice && voices.length > 0) {
      if (langPrefix === "uk") {
        matchedVoice = voices.find((v) => v.name.toLowerCase().includes("ukrainian"));
      }
      if (langPrefix === "pl") {
        matchedVoice = voices.find((v) => v.name.toLowerCase().includes("polish") || v.name.toLowerCase().includes("polski"));
      }
      if (langPrefix === "en") {
        matchedVoice = voices.find((v) => v.name.toLowerCase().includes("english") || v.name.toLowerCase().includes("en-"));
      }
    }

    if (!matchedVoice && voices.length > 0) {
      setVoiceWarningLang(finalLangCode);
    }

    const sentences = text
      .match(/[^.!?]+[.!?]+/g) || [text];

    let currentSentenceIndex = 0;
    setIsSpeaking(true);

    const speakNextSentence = () => {
      if (currentSentenceIndex >= sentences.length) {
        setIsSpeaking(false);
        return;
      }

      const chunkText = sentences[currentSentenceIndex].trim();
      if (!chunkText) {
        currentSentenceIndex++;
        speakNextSentence();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = finalLangCode;
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onend = () => {
        currentSentenceIndex++;
        speakNextSentence();
      };

      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  const stop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    voiceWarningLang,
    closeVoiceWarning,
    speak,
    stop,
  };
};
