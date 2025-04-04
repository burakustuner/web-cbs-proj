// src/components/Toolbar/tools/DrawPoint.js
import React, { useEffect } from 'react';
import { Draw } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { useUserLayers } from '../../../contexts/UserLayersContext';
import { useToolManager } from '../../../contexts/ToolManagerContext';
import { generateSmartFeatureId } from '../../../utils/generateSmartFeatureId';

function DrawPoint({ map }) {
  const { addFeatureToActiveLayer } = useUserLayers();
  const { openTool, isToolActive, closeTool } = useToolManager();

  const active = isToolActive('draw-point');

  useEffect(() => {
    console.log('🎯 useEffect: draw interaction ekleniyor');
    if (!map || !active) return;

    const draw = new Draw({
      source: null,
      type: 'Point',
    });

    map.addInteraction(draw);

    const listener = draw.on('drawend', (event) => {
      const feature = event.feature;
      feature.setId(generateSmartFeatureId(feature));
      addFeatureToActiveLayer(feature);
      console.log('🆕 Nokta eklendi. ID:', feature.getId());
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
              title: 'New Point',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawPoint map={map} />,
              //component: DrawPoint, // ✅ sadece aktifse render edilir
              //props: { map },       // ✅ isteğe bağlı prop'lar

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
