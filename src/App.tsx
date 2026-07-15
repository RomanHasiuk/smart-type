import { useRef, useEffect, useState } from "react";
import { Mic, Square, Sparkles, Copy, Trash2, Volume2, VolumeX, Check, Activity, Eye, EyeOff, Monitor, Sun, Moon, Flower2 } from "lucide-react";
import "./App.css";
import { useAudioCapture } from "./hooks/useAudioCapture";
import { useGeminiLive } from "./hooks/useGeminiLive";
import { ComboBox } from "./components/ComboBox";

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
  "Git Commit Message",
  "StackOverflow Answer",
  "Technical Writer",
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

const THEMES = [
  { id: 'system', name: 'System Theme', icon: <Monitor size={16} /> },
  { id: 'light-minimal', name: 'Light Minimal', icon: <Sun size={16} /> },
  { id: 'pitch-black', name: 'Dark Theme', icon: <Moon size={16} /> },
  { id: 'cream-rose', name: 'Cream Rose', icon: <Flower2 size={16} /> }
];

function App() {
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [currentTheme, setCurrentTheme] = useState('system');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [showApiKey, setShowApiKey] = useState(false);

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
  } = useGeminiLive(origCursor, transCursor, targetLanguage || "Ukrainian", tone || "Neutral");

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

  // Auto-expand textareas
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  const [copiedTranslated, setCopiedTranslated] = useState<boolean>(false);

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const toggleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel(); 
      
      const langMap: Record<string, string> = {
        "ukrainian": "uk-UA",
        "english": "en-US",
        "polish": "pl-PL",
        "spanish": "es-ES",
        "german": "de-DE",
        "italian": "it-IT",
        "french": "fr-FR",
        "chinese": "zh-CN",
        "korean": "ko-KR"
      };
      const normalizedTarget = targetLanguage.toLowerCase().trim();
      const finalLangCode = langMap[normalizedTarget] || detectedLangCode || "en-US";
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = finalLangCode; 
      
      let voices = window.speechSynthesis.getVoices();
      const langPrefix = finalLangCode.split('-')[0].toLowerCase();
      
      let matchedVoice = voices.find(v => {
        const isMatch = v.lang.toLowerCase().startsWith(langPrefix);
        if (langPrefix !== 'de' && v.name.toLowerCase().includes('german')) return false;
        return isMatch;
      });

      if (!matchedVoice) {
         if (langPrefix === 'uk') matchedVoice = voices.find(v => v.name.toLowerCase().includes('ukrainian'));
         if (langPrefix === 'pl') matchedVoice = voices.find(v => v.name.toLowerCase().includes('polish') || v.name.toLowerCase().includes('polski'));
         if (langPrefix === 'en') matchedVoice = voices.find(v => v.name.toLowerCase().includes('english') || v.name.toLowerCase().includes('en-'));
      }
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      } else {
        alert(`Warning: Voice for language (${finalLangCode}) is not installed on your system.\n\nThe text might sound with a strange accent. For perfect speech:\n1. Install the language pack in Windows Settings (Time & Language -> Speech).\n2. OR open this app in Microsoft Edge (which has excellent built-in neural voices).`);
      }
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported in your browser.");
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      if (currentTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', isDark ? 'pitch-black' : 'light-minimal');
      } else {
        document.body.setAttribute('data-theme', currentTheme);
      }
    };
    
    applyTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [currentTheme]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    if (origTextRef.current) adjustHeight(origTextRef.current);
  }, [originalText]);

  useEffect(() => {
    adjustHeight(transTextRef.current);
  }, [translatedText]);

  const copyToClipboard = async (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedTranslated(true);
      setTimeout(() => setCopiedTranslated(false), 2000);
    }
  };

  return (
    <main className="container">
      <div className="theme-switcher">
        {THEMES.map(t => (
          <button 
            key={t.id}
            className={`theme-btn ${currentTheme === t.id ? 'active' : ''}`}
            onClick={() => setCurrentTheme(t.id)}
            title={t.name}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <h1>Smart Type</h1>
      <div className="api-key-container">
        <input
          type={showApiKey ? "text" : "password"} 
          value={apiKey} 
          onChange={handleApiKeyChange} 
          placeholder="Paste your Gemini API Key here..."
        />
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="api-key-toggle-btn"
          title={showApiKey ? "Hide API Key" : "Show API Key"}
        >
          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div
        className={`status-indicator ${isProcessing ? "processing" : "ready"}`}
      >
        {isProcessing ? "⏳ AI is processing text..." : "🟢 Ready to record"}
      </div>

      {!isSupported && (
        <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '10px' }}>
          ⚠️ Your browser does not support audio recording.
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '10px' }}>
          ❌ Error: {error}
        </div>
      )}

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

      <div className="mic-settings">
        <div className="mic-controls">
            {devices.length > 1 && (
              <select
                className="mic-select"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={isCapturing}
              >
                {devices.map(d => {
                  const cleanLabel = d.label
                    ? d.label
                        .replace(/^Default - /i, '')
                        .replace(/^Communications - /i, '')
                        .replace(/Microphone Array/i, 'Microphone')
                        .trim()
                    : `Microphone ${d.deviceId.substring(0, 5)}...`;
                  return (
                    <option key={d.deviceId} value={d.deviceId}>
                      {cleanLabel}
                    </option>
                  );
                })}
              </select>
            )}
            <div className="tooltip-container tooltip-right-align" data-tooltip={isMonitoring ? "Stop test" : "Test microphone"}>
              <button 
                onClick={isMonitoring ? stopMonitoring : startMonitoring} 
                className={`test-mic-button ${isMonitoring ? "active" : ""}`}
              >
                <Activity size={20} />
              </button>
            </div>
          </div>
          <div className="volume-meter-container">
            <div 
              className="volume-meter-bar" 
              style={{ width: `${Math.min(volume, 100)}%` }}
            ></div>
          </div>
        </div>
      <div className="text-blocks">
        <div className="textarea-wrapper">
          <textarea
            ref={origTextRef}
            className="original-text"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            onSelect={(e) => {
              if (e.target instanceof HTMLTextAreaElement) {
                origCursor.current = e.target.selectionStart;
              }
            }}
            onKeyUp={(e) => {
              if (e.target instanceof HTMLTextAreaElement) {
                origCursor.current = e.target.selectionStart;
              }
            }}
            placeholder="Your original text will appear here... You can also type it manually!"
          />
          <div className="action-buttons">
            <div className="tooltip-container" data-tooltip={isCapturing ? "Stop recording" : "Start dictating"}>
              <button
                className={`action-button ${isCapturing ? "recording" : ""}`}
                onClick={handleToggleRecord}
                disabled={isProcessing}
                style={{ borderColor: isCapturing ? '#ef4444' : '', color: isCapturing ? '#ef4444' : '' }}
              >
                {isCapturing ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
              </button>
            </div>
            <div className="tooltip-container" data-tooltip="Process text with AI">
              <button 
                className="action-button" 
                onClick={handleProcessManualText} 
                disabled={isProcessing || !originalText.trim()}
              >
                <Sparkles size={20} />
              </button>
            </div>
            <div className="tooltip-container tooltip-right-align" data-tooltip={copiedOriginal ? "Copied!" : "Copy original text"}>
              <button className="action-button" onClick={() => copyToClipboard(originalText, true)}>
                {copiedOriginal ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
              </button>
            </div>
            <div className="tooltip-container tooltip-right-align" data-tooltip="Clear all">
              <button className="action-button" onClick={() => {
                setOriginalText('');
                setTranslatedText('');
              }}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="textarea-wrapper">
          <textarea
            ref={transTextRef}
            className="translated-text"
            value={translatedText}
            onChange={(e) => {
              setTranslatedText(e.target.value);
              transCursor.current = e.target.selectionStart;
            }}
            onClick={(e) => {
              transCursor.current = e.currentTarget.selectionStart;
            }}
            onKeyUp={(e) => {
              transCursor.current = e.currentTarget.selectionStart;
            }}
            placeholder="Translation..."
          />
          <div className="action-buttons">
            <div className="tooltip-container tooltip-right-align" data-tooltip={isSpeaking ? "Stop speaking" : "Speak translated text"}>
              <button 
                className="action-button" 
                onClick={() => toggleSpeakText(translatedText)} 
                disabled={!translatedText}
              >
                {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            <div className="tooltip-container tooltip-right-align" data-tooltip={copiedTranslated ? "Copied!" : "Copy translated text"}>
              <button
                className="action-button"
                onClick={() => copyToClipboard(translatedText, false)}
              >
                {copiedTranslated ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
              </button>
            </div>
            <div className="tooltip-container tooltip-right-align" data-tooltip="Clear translation">
              <button
                className="action-button"
                onClick={() => setTranslatedText('')}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
