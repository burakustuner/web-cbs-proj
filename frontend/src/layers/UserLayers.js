import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

// Basit bir renk üretici (ileride geliştirilebilir)
const getRandomColor = () => {
  const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function addUserGeoJSONToMap(map, geojsonData, fileName, setUserLayersState) {
  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonData, {
      featureProjection: 'EPSG:3857',
    }),
  });

  const color = getRandomColor();

  const layer = new VectorLayer({
    source,
    style: new Style({
      stroke: new Stroke({ color, width: 2 }),
      fill: new Fill({ color: `${color}33` }), // yarı saydam
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: 'white', width: 1 }),
      }),
    }),
  });

  map.addLayer(layer);

  // Katman bilgisini state'e ekle
  setUserLayersState((prev) => [
    ...prev,
    {
      id: Date.now(), // benzersiz ID
      fileName,
      layer,
      geojson: geojsonData,
    },
  ]);
}
function hexToRGBA(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
export function applyUserStyleToLayer(layer, styles) {
  // Katmanı tarayıcıda test etmek için
  window.__debugLayer = layer;

  layer.setStyle((feature) => {
    const type = feature.getGeometry().getType();

    // Çizgi
    if ((type === 'LineString' || type === 'MultiLineString') && styles.line) {
      return new Style({
        stroke: new Stroke({
          color: styles.line.color || '#000000',
          width: styles.line.width || 2,
          lineDash: styles.line.dash ? styles.line.dash.split(',').map(Number) : undefined,
          lineCap: styles.line.cap || 'round',
          opacity: styles.line.opacity ?? 1,
        }),
      });
    }

    // Nokta
    if ((type === 'Point' || type === 'MultiPoint') && styles.point) {
      return new Style({
        image: new CircleStyle({
          radius: styles.point.radius || 6,
          fill: new Fill({
            color: styles.point.color || '#ff0000',
          }),
          stroke: new Stroke({
            color: styles.point.strokeColor || '#ffffff',
            width: styles.point.strokeWidth || 1,
          }),
        }),
      });
    }

    // Alan
    if ((type === 'Polygon' || type === 'MultiPolygon') && styles.polygon) {
      const rgbaFill = hexToRGBA(styles.polygon.fillColor, styles.polygon.fillOpacity ?? 0.3);
    
      return new Style({
        fill: new Fill({
          color: rgbaFill,
        }),
        stroke: new Stroke({
          color: styles.polygon.strokeColor || '#00ff00',
          width: styles.polygon.strokeWidth || 2,
          lineDash: styles.polygon.strokeDash ? styles.polygon.strokeDash.split(',').map(Number) : undefined,
        }),
      });
    }

    console.warn('[StyleApply] Bilinmeyen geometri tipi:', type);
    return null;
  });

  layer.changed(); // Yeniden çizdir
}