import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboBoxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboBox({ value, onChange, options, placeholder, className, disabled }: ComboBoxProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(value);
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          onChange(inputValue);
        }
        setIsOpen(false);
        setIsTyping(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, onChange, isOpen]);

  const filteredOptions = isTyping
    ? options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()))
    : options;

  const handleSelect = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
      setIsOpen(false);
      setIsTyping(false);
    }
  };

  return (
    <div className={`combobox-container ${className || ''}`} ref={containerRef}>
      <input
        type="text"
        className="combobox-input"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsTyping(true);
          setIsOpen(true);
        }}
        onFocus={(e) => {
          setIsOpen(true);
          setIsTyping(false);
          e.target.select();
        }}
        onKeyDown={handleKeyDown}
      />
      <button 
        type="button" 
        className="combobox-arrow"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setIsTyping(false);
          }
        }}
        disabled={disabled}
      >
        <ChevronDown size={16} />
      </button>
      
      {isOpen && !disabled && (
        <ul className="combobox-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <li 
                key={i} 
                className={opt === value ? 'selected' : ''}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents input from losing focus immediately
                  handleSelect(opt);
                }}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="combobox-empty">
              Натисніть Enter, щоб використати "{inputValue}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
