import React, { createContext, useContext, useState } from "react";

const ToolManagerContext = createContext();

export const useToolManager = () => useContext(ToolManagerContext);

export const ToolManagerProvider = ({ children }) => {
  const [tools, setTools] = useState([]);

  const openTool = (toolConfig) => {
    setTools((prev) => {
      // Eğer singleton ise, aynı ID'deki eski tool'u kapat
      if (toolConfig.singleton) {
        const filtered = prev.filter(t => t.id !== toolConfig.id);
        return [...filtered, toolConfig];
      }
      return [...prev, toolConfig];
    });
  };

  const closeTool = (id) => {
    setTools((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <ToolManagerContext.Provider value={{ tools, openTool, closeTool }}>
      {children}
    </ToolManagerContext.Provider>
  );
};
