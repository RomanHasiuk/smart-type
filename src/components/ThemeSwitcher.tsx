import React from "react";
import { Monitor, Sun, Moon, Flower2 } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const THEMES: Theme[] = [
  { id: "system", name: "System Theme", icon: <Monitor size={20} /> },
  { id: "light-minimal", name: "Light Minimal", icon: <Sun size={20} /> },
  { id: "pitch-black", name: "Dark Theme", icon: <Moon size={20} /> },
  { id: "cream-rose", name: "Cream Rose", icon: <Flower2 size={20} /> },
];

interface ThemeSwitcherProps {
  currentTheme: string;
  onChange: (themeId: string) => void;
}

export function ThemeSwitcher({ currentTheme, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-btn ${currentTheme === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
          title={t.name}
          type="button"
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
