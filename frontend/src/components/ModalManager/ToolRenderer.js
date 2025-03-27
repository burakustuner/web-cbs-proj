import React from "react";
import { useToolManager } from "../../contexts/ToolManagerContext";
import ModalWindow from "../ui/ModalWindow";
const ToolRenderer = () => {
  const { tools } = useToolManager();

  return (
    <>
{tools.map((tool, index) => (
  <ModalWindow
    key={tool.id}
    id={tool.id}
    zIndex={1000 + index}
    title={tool.title}
    onClose={() => closeTool(tool.id)}
  >
    {tool.component}
  </ModalWindow>
))}
    </>
  );
};

export default ToolRenderer;
