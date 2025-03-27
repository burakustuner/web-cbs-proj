import React from "react";
import { useToolManager } from "../../contexts/ToolManagerContext";
import ModalWindow from "../ui/ModalWindow";
const ToolRenderer = () => {
  const { tools, closeTool } = useToolManager();

  return (
    <>
      {tools.map((tool) => tool.render())}
    </>
  );

};

export default ToolRenderer;
