// src/components/Toolbar/tools/EditStyle.js
import React, { useEffect, useState } from 'react';
import FeatureStyleEditorModal from '../../StyleEditor/FeatureStyleEditorModal';
import { unByKey } from 'ol/Observable';
import { useToolManager } from '../../../contexts/ToolManagerContext';

function EditStyle({ map }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { openTool, closeTool, isToolActive } = useToolManager();

  const active = isToolActive('edit-style');

  useEffect(() => {
    console.log('🧩 EditStyle useEffect çalıştı', { map, active }); // <-- EKLE
    if (!map || !active) return;

    const clickHandler = map.on('click', (evt) => {
      console.log('🖱️ Haritaya tıklandı'); // <-- BU GELMİYORSA sorun burda
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);
      if (!feature || feature === selectedFeature) return;
      console.log('🧩 Seçilen Feature:', feature);
      setSelectedFeature(feature);

      openTool({
        id: 'feature-style-editor',
        title: 'Stil Düzenleyici',
        singleton: true,
        canWorkTogether: false,
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
      console.log('🧹 EditStyle temizlendi');
      unByKey(clickHandler);
    };
  }, [map, active, selectedFeature, openTool, closeTool]);

  return (
    <div style={{ padding: "5px" }}>
      <button
        className="toolbar-button"
        onClick={() => {
          if (active) {
            closeTool('edit-style');
          } else {
            openTool({
              id: 'edit-style',
              title: 'Obje Stil Aracı',
              singleton: true,
              canWorkTogether: false,
              render: () => null  // <-- artık bileşeni çağırmıyoruz!
            });
          }
        }}
      >
        {active ? "✔️ Obje Seçimi Açık" : "🌈 Stil Değiştir (Objeye)"}
      </button>
    </div>
  );
}

export default EditStyle;
