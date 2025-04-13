import { useEffect } from 'react';
import { Draw } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { useUserLayers } from '../../../contexts/UserLayersContext';
import { generateSmartFeatureId } from '../../../utils/generateSmartFeatureId';

// This component is only rendered when the tool is active
// It handles drawing for Point, LineString, or Polygon based on the 'type' prop.
function DrawInteraction({ map, type }) {
  const { addFeatureToActiveLayer } = useUserLayers();

  useEffect(() => {
    console.log(`🎯 DrawInteraction (${type}): useEffect çalıştı, draw interaction ekleniyor`);
    if (!map) return; // Component unmounts when inactive

    if (!['Point', 'LineString', 'Polygon'].includes(type)) {
      console.error(`❌ Geçersiz çizim tipi: ${type}`);
      return;
    }

    const draw = new Draw({
      source: null, // Features are added to the layer source directly
      type: type,   // Use the type prop here
    });

    map.addInteraction(draw);
    console.log(`➕ Draw interaction (${type}) eklendi.`);

    const listener = draw.on('drawend', (event) => {
      console.log(`🔴 DrawInteraction (${type}): drawend olayı tetiklendi`, event.feature.getId());
      const feature = event.feature;
      feature.setId(generateSmartFeatureId(feature));
      addFeatureToActiveLayer(feature);
      console.log(`🆕 ${type} eklendi (Interaction). ID:`, feature.getId());
    });

    // Cleanup function
    return () => {
      console.log(`➖ Draw interaction (${type}) kaldırılıyor.`);
      map.removeInteraction(draw);
      unByKey(listener);
    };
    // Dependencies: map, type, and the context function reference
  }, [map, type, addFeatureToActiveLayer]);

  // This component doesn't render anything visual itself
  return null;
}

export default DrawInteraction; 