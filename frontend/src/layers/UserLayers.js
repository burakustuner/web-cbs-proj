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

export function applyUserStyleToLayer(layer, styles) {
  // DEBUG: Katman referansını tarayıcıya global olarak atıyoruz
  console.log('[StyleApply] Layer:', layer);
  window.__debugLayer = layer;

  // Stil fonksiyonunu katmana uyguluyoruz
  layer.setStyle((feature) => {
    const type = feature.getGeometry().getType();
    console.log('[StyleApply] Feature geometry type:', type);


    if ((type === 'LineString' || type === 'MultiLineString') && styles.line) {
      console.log('[StyleApply] Çizgi Stili:', styles.line);
      console.log('[StyleApply] Çizgi rengi:', styles.line.color);
      console.log('[StyleApply] Çizgi kalınlığı:', styles.line.width, typeof styles.line.width);
      return new Style({
        stroke: new Stroke({
          color: styles.line.color || 'black',
          width: styles.line.width || 2,
        }),
      });
    }

    if ((type === 'Polygon' || type === 'MultiPolygon') && styles.polygon) {
      console.log('[StyleApply] Poligon Stili:', styles.polygon);

    
      return new Style({
        stroke: new Stroke({
          color: styles.polygon.strokeColor || 'green',
          width: 2,
        }),
        fill: new Fill({
          color: styles.polygon.fillColor || 'rgba(0,255,0,0.3)',
        }),
      });
    }

    if ((type === 'Point' || type === 'MultiPoint') && styles.point) {
      console.log('[StyleApply] Nokta Stili:', styles.point);
      return new Style({
        image: new CircleStyle({
          radius: styles.point.radius || 6,
          fill: new Fill({ color: styles.point.color || 'red' }),
          stroke: new Stroke({ color: 'white', width: 1 }),
        }),
      });
    }

    console.warn('[StyleApply] Bilinmeyen geometri tipi:', type);
    return null;
  });
  layer.changed();
}