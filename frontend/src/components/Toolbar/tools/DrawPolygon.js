// src/components/Toolbar/tools/DrawPolygon.js
import React from 'react';
import { useToolManager } from '../../../contexts/ToolManagerContext';
import DrawInteraction from './DrawInteraction';

function DrawPolygon({ map }) {
  const { openTool, isToolActive, closeTool } = useToolManager();
  const active = isToolActive('draw-polygon');

  return (
    <div style={{ padding: "5px" }}>
      <button
        className="toolbar-button"
        onClick={() => {
          if (active) {
            closeTool('draw-polygon');
          } else {
            openTool({
              id: 'draw-polygon',
              title: 'New Polygon',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawInteraction map={map} type="Polygon" />,
            });
          }
        }}
      >
        {active ? '✔️ Drawing Polygon' : '📍 New Polygon'}
      </button>
    </div>
  );
}

export default DrawPolygon;
