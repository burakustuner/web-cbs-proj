// src/components/Toolbar/tools/DrawPolygon.js
import React, { useEffect } from 'react';
import { Draw } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { useUserLayers } from '../../../contexts/UserLayersContext';
import { useToolManager } from '../../../contexts/ToolManagerContext';

function DrawPolygon({ map }) {
  const { addFeatureToActiveLayer } = useUserLayers();
  const { openTool, isToolActive, closeTool } = useToolManager();

  const active = isToolActive('draw-polygon');

  useEffect(() => {
    if (!map || !active) return;

    const draw = new Draw({
      source: null,
      type: 'Polygon',
    });

    map.addInteraction(draw);

    const listener = draw.on('drawend', (event) => {
      addFeatureToActiveLayer(event.feature);
    });

    return () => {
      map.removeInteraction(draw);
      unByKey(listener);
    };
  }, [map, active]);

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
              title: 'Alan Çiz',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawPolygon map={map} />
            });
          }
        }}
      >
        {active ? '✔️ Alan Çiziliyor' : '📐 Alan Çiz'}
      </button>
    </div>
  );
}

export default DrawPolygon;
