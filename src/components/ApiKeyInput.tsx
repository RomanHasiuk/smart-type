import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  apiKey: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ApiKeyInput({ apiKey, onChange }: ApiKeyInputProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="api-key-container">
      <input
        type={showApiKey ? "text" : "password"}
        value={apiKey}
        onChange={onChange}
        placeholder="Paste your Gemini API Key here..."
      />
      <button
        type="button"
        onClick={() => setShowApiKey(!showApiKey)}
        className="api-key-toggle-btn"
        title={showApiKey ? "Hide API Key" : "Show API Key"}
      >
        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
