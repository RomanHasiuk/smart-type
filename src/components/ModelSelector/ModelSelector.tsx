import { useState, useRef, useEffect } from "react";
import { Zap, Brain, Check, ChevronDown } from "lucide-react";
import "./ModelSelector.css";
import { AI_MODELS } from "../../config";

interface ModelSelectorProps {
  aiModel: string;
  onChange: (modelId: string) => void;
  isProcessing: boolean;
}

export function ModelSelector({ aiModel, onChange, isProcessing }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find((m) => m.id === aiModel) || AI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="model-selector-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`model-selector-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
      >
        {currentModel.type === "pro" ? (
          <Brain size={18} className="model-icon pro" />
        ) : (
          <Zap size={18} className="model-icon lite" />
        )}
        <span className="model-selector-label">{currentModel.label}</span>
        <ChevronDown size={14} className={`chevron-icon ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="model-popover">
          <div className="popover-header">Select AI Model</div>
          <div className="popover-list">
            {AI_MODELS.map((model) => {
              const isSelected = model.id === currentModel.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  className={`popover-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onChange(model.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="popover-item-left">
                    {model.type === "pro" ? (
                      <Brain size={16} className="model-icon pro" />
                    ) : (
                      <Zap size={16} className="model-icon lite" />
                    )}
                    <span className="model-name">{model.label}</span>
                  </div>
                  <div className="popover-item-right">
                    <span className={`model-badge ${model.type}`}>{model.type.toUpperCase()}</span>
                    {isSelected && <Check size={14} className="check-icon" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
