import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import Overlay from 'ol/Overlay';
import API_BASE_URL from './config';
import LayerPanel from './components/LayerPanel/LayerPanel';
import Toolbar from './components/Toolbar/Toolbar';
import StyleEditorModal from './components/StyleEditor/StyleEditorModal';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const mapRef = useRef();
  const popupRef = useRef();
  const [map, setMap] = useState(null);

  const [systemLayers, setSystemLayers] = useState({});
  const [userLayers, setUserLayers] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState({});
  const [styleEditorVisible, setStyleEditorVisible] = useState(false);
  const [styleEditorTargetKey, setStyleEditorTargetKey] = useState(null);

  useEffect(() => {
    const baseLayer = new TileLayer({ source: new OSM() });

    const mapObject = new Map({
      target: mapRef.current,
      layers: [baseLayer],
      view: new View({
        center: fromLonLat([32.5, 39.0]),
        zoom: 6,
      }),
    });

    setMap(mapObject);

    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });

    mapObject.addOverlay(overlay);

    const loadSystemLayer = (key, url, style) => {
      fetch(`${API_BASE_URL}/${url}`)
        .then(res => res.json())
        .then(data => {
          const source = new VectorSource({
            features: new GeoJSON().readFeatures(data, {
              featureProjection: 'EPSG:3857',
            }),
          });

          const layer = new VectorLayer({ source, style });
          mapObject.addLayer(layer);

          setSystemLayers(prev => ({ ...prev, [key]: { layer, label: key.charAt(0).toUpperCase() + key.slice(1) } }));
          setVisibleLayers(prev => ({ ...prev, [key]: true }));
        });
    };

    loadSystemLayer('cities', 'cities', new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.8)' }),
        stroke: new Stroke({ color: 'white', width: 1 }),
      }),
    }));

    loadSystemLayer('roads', 'roads', new Style({
      stroke: new Stroke({ color: '#1976D2', width: 3 })
    }));

    loadSystemLayer('regions', 'regions', new Style({
      stroke: new Stroke({ color: 'green', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 128, 0, 0.2)' })
    }));

    mapObject.on('click', (evt) => {
      const feature = mapObject.forEachFeatureAtPixel(evt.pixel, (feat) => feat);
      if (feature) {
        const props = feature.getProperties();
        const coordinates = feature.getGeometry().getCoordinates();
        overlay.setPosition(coordinates);
        if (popupRef.current) {
          popupRef.current.innerHTML = `
            <div style="background:white;padding:5px;border-radius:4px;">
              <strong>${props.name}</strong><br/>
              Nüfus: ${props.population ? props.population.toLocaleString() : 'Bilinmiyor'}
            </div>
          `;
        }
      } else {
        if (popupRef.current) {
          popupRef.current.innerHTML = '';
          overlay.setPosition(undefined);
        }
      }
    });
  }, []);

  useEffect(() => {
    Object.entries(systemLayers).forEach(([key, { layer }]) => {
      layer.setVisible(visibleLayers[key] ?? true);
    });
  }, [visibleLayers, systemLayers]);

  const onZoomToLayer = (layerKey) => {
    const layer = systemLayers[layerKey]?.layer || userLayers.find(l => `user-${l.id}` === layerKey)?.layer;
    if (layer && map) {
      const extent = layer.getSource().getExtent();
      map.getView().fit(extent, { duration: 500, padding: [20, 20, 20, 20] });
    }
  };

  const handleOpacityChange = (layerKey, value) => {
    const layer = systemLayers[layerKey]?.layer || userLayers.find(l => `user-${l.id}` === layerKey)?.layer;
    if (layer) layer.setOpacity(value);
  };

  const bringLayerToFront = (layerKey) => {
    const layer = systemLayers[layerKey]?.layer || userLayers.find(l => `user-${l.id}` === layerKey)?.layer;
    if (layer && map) {
      map.removeLayer(layer);
      map.addLayer(layer);
    }
  };

  const changeLayerStyle = (layerKey) => {
    setStyleEditorTargetKey(layerKey);
    setStyleEditorVisible(true);
  };

  const handleStyleSave = (layerKey, styles) => {
    const layer = systemLayers[layerKey]?.layer || userLayers.find(l => `user-${l.id}` === layerKey)?.layer;
    if (!layer) return;
  
    layer.setStyle((feature) => {
      const type = feature.getGeometry().getType();
  
      if ((type === 'Point' || type === 'MultiPoint') && styles.point) {
        return new Style({
          image: new CircleStyle({
            radius: styles.point.radius,
            fill: new Fill({ color: styles.point.color }),
            stroke: new Stroke({ color: '#fff', width: 1 })
          })
        });
      }
  
      if ((type === 'LineString' || type === 'MultiLineString') && styles.line) {
        return new Style({
          stroke: new Stroke({
            color: styles.line.color,
            width: styles.line.width
          })
        });
      }
  
      if ((type === 'Polygon' || type === 'MultiPolygon') && styles.polygon) {
        return new Style({
          stroke: new Stroke({ color: styles.polygon.strokeColor, width: 2 }),
          fill: new Fill({ color: styles.polygon.fillColor })
        });
      }
  
      return null;
    });
  };
  

  const removeLayer = (layerKey) => {
    if (!map) return;

    if (systemLayers[layerKey]) {
      map.removeLayer(systemLayers[layerKey].layer);
      setSystemLayers(prev => {
        const updated = { ...prev };
        delete updated[layerKey];
        return updated;
      });
    } else {
      const userLayer = userLayers.find(l => `user-${l.id}` === layerKey);
      if (userLayer) {
        map.removeLayer(userLayer.layer);
        setUserLayers(prev => prev.filter(l => `user-${l.id}` !== layerKey));
      }
    }
  };

  const renameLayer = (layerKey, newName) => {
    if (systemLayers[layerKey]) {
      setSystemLayers(prev => ({
        ...prev,
        [layerKey]: {
          ...prev[layerKey],
          label: newName
        }
      }));
    } else {
      setUserLayers(prev => prev.map(l =>
        `user-${l.id}` === layerKey ? { ...l, filename: newName } : l
      ));
    }
  };

  const handleGeoJSONImport = ({ filename, data }) => {
    if (!map) return;
    const source = new VectorSource({
      features: new GeoJSON().readFeatures(data, {
        featureProjection: 'EPSG:3857',
      }),
    });

    const layer = new VectorLayer({
      source,
      style: (feature) => {
        const type = feature.getGeometry().getType();
      
        if (type === 'Point' || type === 'MultiPoint') {
          return new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: 'red' }),
              stroke: new Stroke({ color: 'white', width: 1 }),
            }),
          });
        }
      
        if (type === 'LineString' || type === 'MultiLineString') {
          return new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 2,
            }),
          });
        }
      
        if (type === 'Polygon' || type === 'MultiPolygon') {
          return new Style({
            stroke: new Stroke({ color: 'green', width: 2 }),
            fill: new Fill({ color: 'rgba(0,255,0,0.2)' }),
          });
        }
      
        return null;
      }
      
    });

    map.addLayer(layer);

    const id = uuidv4();
    setUserLayers((prev) => [...prev, { id, filename, layer }]);
  };

  return (
    <>
      <Toolbar
        onImportKML={() => alert("KML import tıklandı")}
        onImportGeoJSON={handleGeoJSONImport}
      />
      <LayerPanel
        systemLayers={systemLayers}
        visibleLayers={visibleLayers}
        setVisibleLayers={setVisibleLayers}
        onZoom={onZoomToLayer}
        onOpacityChange={handleOpacityChange}
        onBringToFront={bringLayerToFront}
        onChangeStyle={changeLayerStyle}
        onRemoveLayer={removeLayer}
        onRenameLayer={renameLayer}
        userLayers={userLayers}
        setUserLayers={setUserLayers}
        onOpenStyleEditor={(key) => {
          setStyleEditorTargetKey(key);
          setStyleEditorVisible(true);
        }}
        
      />

      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
      <div ref={popupRef} className="ol-popup"></div>

      {styleEditorVisible && (
  <StyleEditorModal
    key={styleEditorTargetKey} // 💥 bu satır bileşeni sıfırdan mount eder
    layerKey={styleEditorTargetKey}
    onClose={() => setStyleEditorVisible(false)}
    //onSave={handleStyleSave}
    userLayers={userLayers}
  />
)}
    </>
  );
}

export default App;
