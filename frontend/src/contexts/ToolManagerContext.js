import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const ToolManagerContext = createContext();

export const useToolManager = () => useContext(ToolManagerContext);

export const ToolManagerProvider = ({ children }) => {
  const [tools, setTools] = useState([]);

  const openTool = useCallback((toolConfig) => {
    setTools((prevTools) => {
      let newTools = [...prevTools];

      // 💥 Singleton ve birlikte çalışamazsa, diğer singletonları kapat
      if (toolConfig.singleton && !toolConfig.canWorkTogether) {
        newTools = newTools.filter(t => !(t.singleton && !t.canWorkTogether));
      }

      // Aynı ID varsa eklemeyelim (replace if exists? depends on desired behavior)
      if (!newTools.find(t => t.id === toolConfig.id)) {
        console.log(`➕ Tool opened: ${toolConfig.id}`, toolConfig);
        newTools.push(toolConfig);
      } else {
        console.log(`⚠️ Tool already open: ${toolConfig.id}`);
        // Optionally replace existing config?
        // newTools = newTools.map(t => t.id === toolConfig.id ? toolConfig : t);
      }

      return newTools;
    });
  }, []);

  const closeTool = useCallback((id) => {
    setTools((prev) => {
        const toolExists = prev.some(t => t.id === id);
        if (toolExists) {
            console.log(`➖ Tool closed: ${id}`);
            return prev.filter(t => t.id !== id);
        }
        return prev; // No change if tool doesn't exist
    });
  }, []);

  const isToolActive = useCallback((id) => tools.some(t => t.id === id), [tools]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    tools,
    openTool,
    closeTool,
    isToolActive
  }), [tools, openTool, closeTool, isToolActive]);

  return (
    <ToolManagerContext.Provider
      value={contextValue}
    >
      {children}
            {/* 👇 Aktif araçların bileşenlerini render et - Render logic might need adjustment */}
            {tools.map((tool) => {
                // Check if render function exists before calling
                if (typeof tool.render === 'function') {
                    return <React.Fragment key={tool.id}>{tool.render()}</React.Fragment>;
                }
                // Fallback for potential older 'component' usage if needed
                const Component = tool.component;
                if (Component) {
                   return <Component key={tool.id} {...(tool.props || {})} />;
                }
                return null; // Don't render if no render function or component
            })}
    </ToolManagerContext.Provider>
  );
};
