import React, { useState, useEffect } from 'react';
import FeatureStyleEditorModal from '../../StyleEditor/FeatureStyleEditorModal';
import { unByKey } from 'ol/Observable';
import { useToolManager } from '../../../contexts/ToolManagerContext';

function EditStyle({ map }) {
  const [active, setActive] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { openTool, closeTool } = useToolManager();

  useEffect(() => {
    if (!map || !active) return;

    const clickHandler = map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);
      if (!feature || feature === selectedFeature) return;

      setSelectedFeature(feature);

      openTool({
        id: 'feature-style-editor',
        title: 'Stil Düzenleyici',
        singleton: true,
        render: () => (
          <FeatureStyleEditorModal
            feature={feature}
            onClose={() => {
              setSelectedFeature(null);
              closeTool('feature-style-editor');
            }}
          />
        )
      });
    });

    return () => {
      unByKey(clickHandler);
    };
  }, [map, active, selectedFeature, openTool, closeTool]);

  return (
    <div style={{ padding: "5px" }}>
      <button className="toolbar-button" onClick={() => setActive(!active)}>
        {active ? "✔️ Obje Seçimi Açık" : "🌈 Stil Değiştir (Objeye)"}
      </button>
    </div>
  );
}

export default EditStyle;
