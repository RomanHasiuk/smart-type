import React from "react";
import { AlertTriangle, X } from "lucide-react";
import "./VoiceModal.css";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  langCode: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, langCode }) => {
  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay" onClick={onClose}>
      <div className="voice-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="voice-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="voice-modal-header">
          <div className="voice-modal-icon-badge">
            <AlertTriangle size={24} color="#f59e0b" />
          </div>
          <h3>Voice Package Not Found ({langCode})</h3>
        </div>

        <div className="voice-modal-body">
          <p>
            Your operating system is missing a native voice package for language <strong>{langCode}</strong>.
            Due to this, speech synthesis may sound with an accent or fallback voice.
          </p>

          <div className="voice-modal-tips">
            <h4>💡 How to get ideal neural voice playback:</h4>
            <ul>
              <li>
                <strong>Option 1 (Recommended):</strong> Open this application in <strong>Microsoft Edge</strong> (it includes high-quality neural voices for all languages by default).
              </li>
              <li>
                <strong>Option 2:</strong> Install the language pack in Windows settings (<em>Settings -&gt; Time &amp; language -&gt; Speech</em>).
              </li>
            </ul>
          </div>
        </div>

        <div className="voice-modal-footer">
          <button className="voice-modal-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
