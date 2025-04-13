import React from 'react';
import { useToolManager } from '../../../contexts/ToolManagerContext';
import DrawInteraction from './DrawInteraction';

function DrawLine({ map }) {
  const { openTool, isToolActive, closeTool } = useToolManager();
  const active = isToolActive('draw-line');

  return (
    <div style={{ padding: "5px" }}>
      <button
        className="toolbar-button"
        onClick={() => {
          if (active) {
            closeTool('draw-line');
          } else {
            openTool({
              id: 'draw-line',
              title: 'New Line',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawInteraction map={map} type="LineString" />,
            });
          }
        }}
      >
        {active ? '✔️ Drawing Line' : '📏 New Line'}
      </button>
    </div>
  );
}

export default DrawLine;
