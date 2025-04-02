// src/components/Toolbar/tools/DrawPoint.js
import React, { useEffect } from 'react';
import { Draw } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { useUserLayers } from '../../../contexts/UserLayersContext';
import { useToolManager } from '../../../contexts/ToolManagerContext';

function DrawPoint({ map }) {
  const { addFeatureToActiveLayer } = useUserLayers();
  const { openTool, isToolActive, closeTool } = useToolManager();

  const active = isToolActive('draw-point');

  useEffect(() => {
    if (!map || !active) return;

    const draw = new Draw({
      source: null,
      type: 'Point',
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
            closeTool('draw-point');
          } else {
            openTool({
              id: 'draw-point',
              title: 'Nokta Çiz',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawPoint map={map} />,
            });
          }
        }}
      >
        {active ? '✔️ Nokta Çiziliyor' : '📍 Nokta Çiz'}
      </button>
    </div>
  );
}

export default DrawPoint;
