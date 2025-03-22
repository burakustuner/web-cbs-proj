import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

export function createCitiesLayer(geojsonData) {
  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857',
    }),
  });

  return new VectorLayer({
    source,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.8)' }),
        stroke: new Stroke({ color: 'white', width: 1 }),
      }),
    }),
  });
}
