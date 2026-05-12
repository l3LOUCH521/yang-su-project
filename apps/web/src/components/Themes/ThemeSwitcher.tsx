"use client";

import { Button } from "@repo/ui/button";
import { useTheme } from "./ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark Mode" : <span className="text-white">☀️ Light Mode</span>}
    </Button>
  );
};

export default ThemeSwitch;