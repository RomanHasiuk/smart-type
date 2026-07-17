import { useRef, useEffect, useState } from "react";
import "./App.css";
import { useAudioCapture } from "./hooks/useAudioCapture";
import { useGeminiLive } from "./hooks/useGeminiLive";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { ComboBox } from "./components/ComboBox/ComboBox";
import { ThemeSwitcher } from "./components/ThemeSwitcher/ThemeSwitcher";
import { ApiKeyInput } from "./components/ApiKeyInput/ApiKeyInput";
import { ModelSelector } from "./components/ModelSelector/ModelSelector";
import { AudioSettings } from "./components/AudioSettings/AudioSettings";
import { TextWorkspace } from "./components/TextWorkspace/TextWorkspace";

const LANGUAGES = [
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
  "Kotlin",
];

const TONES = [
  "Neutral",
  "Professional",
  "Casual",
  "Friendly",
  "Slang",
  "Concise",
  "Discord",
  "Senior Developer",
  "Code Reviewer",
  "Prompt Engineering",
  "Git Commit Message",
  "StackOverflow Answer",
  "Technical Writer",
  "Markdown",
  "Formal Letter with Greeting & Signature",
  "Newspaper Report Style",
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

function App() {
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [isQaMode, setIsQaMode] = useState(false);
  const [aiModel, setAiModel] = useState<"lite" | "pro">("lite");
  const [currentTheme, setCurrentTheme] = useState("system");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem("gemini_api_key", val);
  };

  const origCursor = useRef<number>(0);
  const transCursor = useRef<number>(0);
  const origTextRef = useRef<HTMLTextAreaElement>(null);
  const transTextRef = useRef<HTMLTextAreaElement>(null);

  const {
    isCapturing,
    isSupported,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    volume,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    startCapture,
    stopCapture,
  } = useAudioCapture();

  const {
    isProcessing,
    error,
    originalText,
    setOriginalText,
    translatedText,
    setTranslatedText,
    detectedLangCode,
    processAudio,
    processText,
  } = useGeminiLive(
    origCursor,
    transCursor,
    targetLanguage || "Ukrainian",
    tone || "Neutral",
    isQaMode,
    aiModel
  );

  const { isSpeaking, speak } = useSpeechSynthesis();

  const recordingTimeoutRef = useRef<number | null>(null);

  const handleToggleRecord = async () => {
    if (isCapturing) {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      const audioBlob = await stopCapture();
      if (audioBlob) {
        processAudio(audioBlob);
      }
    } else {
      const started = await startCapture();
      if (started) {
        recordingTimeoutRef.current = setTimeout(async () => {
          const audioBlob = await stopCapture();
          if (audioBlob) processAudio(audioBlob);
        }, 3 * 60 * 1000);
      }
    }
  };

  const handleProcessManualText = () => {
    if (originalText.trim()) {
      processText(originalText);
    }
  };

  const handleSpeakText = (text: string) => {
    speak(text, targetLanguage || "Ukrainian", detectedLangCode);
  };

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      if (currentTheme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.body.setAttribute("data-theme", isDark ? "pitch-black" : "light-minimal");
      } else {
        document.body.setAttribute("data-theme", currentTheme);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (origTextRef.current) adjustHeight(origTextRef.current);
  }, [originalText]);

  useEffect(() => {
    if (transTextRef.current) adjustHeight(transTextRef.current);
  }, [translatedText]);

  return (
    <main className="container">
      <ThemeSwitcher currentTheme={currentTheme} onChange={setCurrentTheme} />

      <h1 className="container-title">Smart Type</h1>

      <ApiKeyInput apiKey={apiKey} onChange={handleApiKeyChange} />

      <div className="status-and-model-row">
        <div className={`status-indicator ${isProcessing ? "processing" : "ready"}`}>
          {isProcessing ? "⏳ AI is processing text..." : "🟢 Ready to record"}
        </div>

        <ModelSelector aiModel={aiModel} onChange={setAiModel} isProcessing={isProcessing} />
      </div>

      {!isSupported && (
        <div className="error-message">⚠️ Your browser does not support audio recording.</div>
      )}

      {error && <div className="error-message">❌ Error: {error}</div>}

      <div className="controls-row">
        <ComboBox
          className="language-combobox"
          value={targetLanguage}
          onChange={setTargetLanguage}
          options={LANGUAGES}
          placeholder="Ukrainian"
          disabled={isCapturing || isProcessing}
        />

        <ComboBox
          className="tone-combobox"
          value={tone}
          onChange={setTone}
          options={TONES}
          placeholder="Neutral"
          disabled={isCapturing || isProcessing}
        />
      </div>

      <AudioSettings
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
        isCapturing={isCapturing}
        volume={volume}
        isMonitoring={isMonitoring}
        startMonitoring={startMonitoring}
        stopMonitoring={stopMonitoring}
      />

      <TextWorkspace
        originalText={originalText}
        setOriginalText={setOriginalText}
        translatedText={translatedText}
        setTranslatedText={setTranslatedText}
        origTextRef={origTextRef}
        transTextRef={transTextRef}
        origCursor={origCursor}
        transCursor={transCursor}
        isCapturing={isCapturing}
        isProcessing={isProcessing}
        isQaMode={isQaMode}
        setIsQaMode={setIsQaMode}
        handleToggleRecord={handleToggleRecord}
        handleProcessManualText={handleProcessManualText}
        isSpeaking={isSpeaking}
        onSpeakText={handleSpeakText}
      />
    </main>
  );
}

export default App;
