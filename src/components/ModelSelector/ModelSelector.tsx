import { Zap, Brain } from "lucide-react";
import "./ModelSelector.css";

interface ModelSelectorProps {
  aiModel: "lite" | "pro";
  onChange: (model: "lite" | "pro") => void;
  isProcessing: boolean;
}

export function ModelSelector({ aiModel, onChange, isProcessing }: ModelSelectorProps) {
  const isPro = aiModel === "pro";

  const handleToggle = () => {
    onChange(isPro ? "lite" : "pro");
  };

  return (
    <div
      className="tooltip-container"
      data-tooltip={
        isPro
          ? "Current model: 3.5 flash\nSwitch to 3.1 Flash Lite"
          : "Current model: 3.1 flash lite\nSwitch to 3.5 Flash"
      }
    >
      <button
        type="button"
        className="model-icon-btn"
        onClick={handleToggle}
        disabled={isProcessing}
      >
        {isPro ? <Brain size={20} /> : <Zap size={20} />}
      </button>
    </div>
  );
}
