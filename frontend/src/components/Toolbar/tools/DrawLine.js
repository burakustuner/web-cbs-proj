import React, { useEffect } from 'react';
import { Draw } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { useUserLayers } from '../../../contexts/UserLayersContext';
import { useToolManager } from '../../../contexts/ToolManagerContext';

function DrawLine({ map }) {
  const { addFeatureToActiveLayer } = useUserLayers();
  const { openTool, isToolActive, closeTool } = useToolManager();

  useEffect(() => {
    if (!map || !isToolActive('draw-line')) return;

    const draw = new Draw({
      source: null,
      type: 'LineString',
    });

    map.addInteraction(draw);

    const listener = draw.on('drawend', (event) => {
      addFeatureToActiveLayer(event.feature);
    });

    return () => {
      map.removeInteraction(draw);
      unByKey(listener);
    };
  }, [map, isToolActive('draw-line')]);

  return (
    <div style={{ padding: "5px" }}>
      <button
        className="toolbar-button"
        onClick={() => {
          if (isToolActive('draw-line')) {
            closeTool('draw-line');
          } else {
            // Bu aracı ToolManager'a aç olarak bildiriyoruz
            // singleton: true ve canWorkTogether: false olduğu için diğer singleton araçları kapatacak
            openTool({
              id: 'draw-line',
              title: 'Çizgi Çiz',
              singleton: true,
              canWorkTogether: false,
              render: () => <DrawLine map={map} />
            });
          }
        }}
      >
        {isToolActive('draw-line') ? '✔️ Çizgi Çiziliyor' : '📏 Çizgi Çiz'}
      </button>
    </div>
  );
}

export default DrawLine;
