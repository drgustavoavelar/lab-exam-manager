import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompatibilityModeContextType {
  isCompatibilityMode: boolean;
  toggleCompatibilityMode: () => void;
}

const CompatibilityModeContext = createContext<CompatibilityModeContextType | undefined>(undefined);

export function CompatibilityModeProvider({ children }: { children: ReactNode }) {
  const [isCompatibilityMode, setIsCompatibilityMode] = useState(() => {
    // Carrega preferência salva do localStorage
    const saved = localStorage.getItem("compatibilityMode");
    return saved === "true";
  });

  useEffect(() => {
    // Salva preferência no localStorage
    localStorage.setItem("compatibilityMode", String(isCompatibilityMode));
  }, [isCompatibilityMode]);

  const toggleCompatibilityMode = () => {
    setIsCompatibilityMode((prev) => !prev);
  };

  return (
    <CompatibilityModeContext.Provider value={{ isCompatibilityMode, toggleCompatibilityMode }}>
      {children}
    </CompatibilityModeContext.Provider>
  );
}

export function useCompatibilityMode() {
  const context = useContext(CompatibilityModeContext);
  if (context === undefined) {
    throw new Error("useCompatibilityMode must be used within a CompatibilityModeProvider");
  }
  return context;
}
