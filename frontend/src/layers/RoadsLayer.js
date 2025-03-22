import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Stroke, Style } from 'ol/style';

export function createRoadsLayer(geojsonData) {
  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857',
    }),
  });

  return new VectorLayer({
    source,
    style: new Style({
      stroke: new Stroke({
        color: '#1976D2',
        width: 3,
      }),
    }),
  });
}
