import React, { useState, useEffect } from 'react';
import FeatureStyleEditorModal from '../../StyleEditor/FeatureStyleEditorModal';
import { unByKey } from 'ol/Observable';

function EditStyle({ map }) {
  const [active, setActive] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    if (!map || !active) return;

    const clickHandler = map.on('click', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);
        if (feature) {
          setSelectedFeature(feature);
        }
      });

    return () => {
      unByKey(clickHandler);
    };
  }, [map, active]);

  return (
    <>
      <div style={{ padding: "5px" }}>
        <button className="toolbar-button" onClick={() => setActive(!active)}>
          {active ? "✔️ Obje Seçimi Açık" : "🌈 Stil Değiştir (Objeye)"}
        </button>
      </div>
  
      {selectedFeature && (
        <FeatureStyleEditorModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </>
  );
}

export default EditStyle;
