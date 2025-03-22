import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';

export function createRegionsLayer(geojsonData) {
  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857',
    }),
  });

  return new VectorLayer({
    source,
    style: new Style({
      stroke: new Stroke({
        color: 'green',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(0, 128, 0, 0.2)',
      }),
    }),
  });
}
