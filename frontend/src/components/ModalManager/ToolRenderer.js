// src/components/ToolRenderer.js
import React from "react";
import { useToolManager } from "../../contexts/ToolManagerContext";

const ToolRenderer = () => {
  const { tools } = useToolManager();

  return (
    <>
      {tools.map((tool) => {
        console.log('🧩 render edilen tool:', tool.id);
        const Component = tool.component;
        return Component ? (
          <Component key={tool.id} {...(tool.props || {})} />
        ) : null;
      })}
    </>
  );
};

export default ToolRenderer;

