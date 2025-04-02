import React, { createContext, useContext, useState } from "react";

const ToolManagerContext = createContext();

export const useToolManager = () => useContext(ToolManagerContext);

export const ToolManagerProvider = ({ children }) => {
  const [tools, setTools] = useState([]);

  const openTool = (toolConfig) => {
    setTools((prevTools) => {
      let newTools = [...prevTools];

      // 💥 Singleton ve birlikte çalışamazsa, diğer singletonları kapat
      if (toolConfig.singleton && !toolConfig.canWorkTogether) {
        newTools = newTools.filter(t => !(t.singleton && !t.canWorkTogether));
      }

      // Aynı ID varsa eklemeyelim
      if (!newTools.find(t => t.id === toolConfig.id)) {
        newTools.push(toolConfig);
      }

      return newTools;
    });
  };

  const closeTool = (id) => {
    setTools((prev) => prev.filter(t => t.id !== id));
  };

  const isToolActive = (id) => tools.some(t => t.id === id);

  return (
    <ToolManagerContext.Provider
      value={{ tools, openTool, closeTool, isToolActive }}
    >
      {children}
    </ToolManagerContext.Provider>
  );
};
