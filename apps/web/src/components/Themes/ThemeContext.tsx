"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

//define theme types can only be light or dark
export type Theme = "light" | "dark";

// sharing current theme globally, and the function to change it.
interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

// create themecontext, starts empty (undefined).
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = "light",
}: PropsWithChildren<{ initialTheme?: Theme }>) {
  
  // Set up the local state to remember if we are currently light or dark
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      // If it was light, make it dark. If it was dark, make it light.
      const nextTheme = prev === "light" ? "dark" : "light";
      
      // Tell Tailwind CSS to switch styles by putting data-theme="dark" on the main <html> tag
      document.documentElement.setAttribute("data-theme", nextTheme);
      
      // save the cookie so if user refresh the page, the cookie will tell us which theme to load first
      document.cookie = `theme=${nextTheme}; path=/; max-age=31536000`;
      
      return nextTheme;
    });
  }, []);

  // toggle Theme function to all children components
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 5. The "Radio Receiver" (Consumer Hook). Other components use this to listen to the station.
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
