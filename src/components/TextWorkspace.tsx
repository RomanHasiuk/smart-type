import { useState, RefObject, MutableRefObject } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Copy,
  Trash2,
  Volume2,
  VolumeX,
  Check,
  HelpCircle,
  MessageCircleQuestion,
} from "lucide-react";

interface TextWorkspaceProps {
  originalText: string;
  setOriginalText: (text: string) => void;
  translatedText: string;
  setTranslatedText: (text: string) => void;
  origTextRef: RefObject<HTMLTextAreaElement>;
  transTextRef: RefObject<HTMLTextAreaElement>;
  origCursor: MutableRefObject<number>;
  transCursor: MutableRefObject<number>;
  isCapturing: boolean;
  isProcessing: boolean;
  isQaMode: boolean;
  setIsQaMode: (val: boolean) => void;
  handleToggleRecord: () => void;
  handleProcessManualText: () => void;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
}

export function TextWorkspace({
  originalText,
  setOriginalText,
  translatedText,
  setTranslatedText,
  origTextRef,
  transTextRef,
  origCursor,
  transCursor,
  isCapturing,
  isProcessing,
  isQaMode,
  setIsQaMode,
  handleToggleRecord,
  handleProcessManualText,
  isSpeaking,
  onSpeakText,
}: TextWorkspaceProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);

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
              type="button"
              className={`action-button ${isCapturing ? "recording" : ""}`}
              onClick={handleToggleRecord}
              disabled={isProcessing}
            >
              {isCapturing ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
            </button>
          </div>
          <div className="tooltip-container" data-tooltip="Process text with AI">
            <button
              type="button"
              className="action-button"
              onClick={handleProcessManualText}
              disabled={isProcessing || !originalText.trim()}
            >
              <Sparkles size={20} />
            </button>
          </div>
          <div className="tooltip-container" data-tooltip={isQaMode ? "Q&A Mode: ON\nSwitch OFF" : "Q&A Mode: OFF\nSwitch ON"}>
            <button
              type="button"
              className={`action-button ${isQaMode ? "qa-active" : ""}`}
              onClick={() => setIsQaMode(!isQaMode)}
              disabled={isProcessing}
            >
              {isQaMode ? <MessageCircleQuestion size={20} /> : <HelpCircle size={20} />}
            </button>
          </div>
          <div className="tooltip-container tooltip-right-align" data-tooltip={copiedOriginal ? "Copied!" : "Copy original text"}>
            <button
              type="button"
              className="action-button"
              onClick={() => copyToClipboard(originalText, true)}
            >
              {copiedOriginal ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
            </button>
          </div>
          <div className="tooltip-container tooltip-right-align" data-tooltip="Clear all">
            <button
              type="button"
              className="action-button"
              onClick={() => {
                setOriginalText("");
                setTranslatedText("");
              }}
            >
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
              type="button"
              className={`action-button ${isSpeaking ? "speaking" : ""}`}
              onClick={() => onSpeakText(translatedText)}
              disabled={!translatedText}
            >
              {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          <div className="tooltip-container tooltip-right-align" data-tooltip={copiedTranslated ? "Copied!" : "Copy translated text"}>
            <button
              type="button"
              className="action-button"
              onClick={() => copyToClipboard(translatedText, false)}
            >
              {copiedTranslated ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
            </button>
          </div>
          <div className="tooltip-container tooltip-right-align" data-tooltip="Clear translation">
            <button
              type="button"
              className="action-button"
              onClick={() => setTranslatedText("")}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
