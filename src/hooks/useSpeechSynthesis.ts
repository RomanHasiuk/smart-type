import { useState, useEffect } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

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

  const speak = (text: string, targetLanguage: string, detectedLangCode: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in your browser.");
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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = finalLangCode;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = finalLangCode.split("-")[0].toLowerCase();

    let matchedVoice = voices.find((v) => {
      const isMatch = v.lang.toLowerCase().startsWith(langPrefix);
      if (langPrefix !== "de" && v.name.toLowerCase().includes("german")) return false;
      return isMatch;
    });

    if (!matchedVoice) {
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

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      alert(
        `Warning: Voice for language (${finalLangCode}) is not installed on your system.\n\nThe text might sound with a strange accent. For perfect speech:\n1. Install the language pack in Windows Settings (Time & Language -> Speech).\n2. OR open this app in Microsoft Edge (which has excellent built-in neural voices).`
      );
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speak,
    stop,
  };
};
