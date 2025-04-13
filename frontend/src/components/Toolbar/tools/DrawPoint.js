// src/components/Toolbar/tools/DrawPoint.js
import React from 'react';
import { useToolManager } from '../../../contexts/ToolManagerContext';
import DrawInteraction from './DrawInteraction';

function DrawPoint({ map }) {
  const { openTool, isToolActive, closeTool } = useToolManager();

  const active = isToolActive('draw-point');

  return (
    <div style={{ padding: "5px" }}>
      <button
        className="toolbar-button"
        onClick={() => {
          if (active) {
            closeTool('draw-point');
          } else {
            openTool({
              id: 'draw-point',
              title: 'New Point',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawInteraction map={map} type="Point" />,
            });
          }
        }}
      >
        {active ? '✔️ Drawing Point' : '📍 New Point'}
      </button>
    </div>
  );
}

export default DrawPoint;
