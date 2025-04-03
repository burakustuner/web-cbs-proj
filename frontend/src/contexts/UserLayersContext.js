// src/contexts/UserLayersContext.js
import React, { createContext, useContext, useState } from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

const UserLayersContext = createContext();

export function UserLayersProvider({ children, map }) {
  const [userLayers, setUserLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

    // 🎨 Varsayılan stil fonksiyonu
    const getDefaultStyleFunction = () => {
      return (feature) => {
        const type = feature.getGeometry().getType();

        if (type === 'Point' || type === 'MultiPoint') {
          return new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: '#ff0000' }),
              stroke: new Stroke({ color: '#ffffff', width: 1 }),
            }),
          });
        }

        if (type === 'LineString' || type === 'MultiLineString') {
          return new Style({
            stroke: new Stroke({ color: '#0000ff', width: 2 }),
          });
        }

        if (type === 'Polygon' || type === 'MultiPolygon') {
          return new Style({
            fill: new Fill({ color: 'rgba(0,255,0,0.3)' }),
            stroke: new Stroke({ color: '#00ff00', width: 2 }),
          });
        }

        return null;
      };
    };
  const createDefaultLayer = () => {
    const source = new VectorSource();
    const layer = new VectorLayer({
      source,
      style: getDefaultStyleFunction(),
    });
    map?.addLayer(layer);
    const defaultLayer = {
      id: 'default',
      name: 'Varsayılan',
      source,
      layer,
      visible: true,
    };
    setUserLayers([defaultLayer]);
    setActiveLayerId('default');
    return defaultLayer;
  };

  const getActiveLayer = () => {
    if (!activeLayerId) return null;
    return userLayers.find((l) => l.id === activeLayerId) || null;
  };

  const addFeatureToActiveLayer = (feature) => {
    let layer = getActiveLayer();

    // Eğer aktif katman yoksa "Varsayılan" yarat
    if (!layer) {
      layer = createDefaultLayer();
    }
    feature.setStyle(null); // ✅ Layer stilini kullansın
    layer.source.addFeature(feature);
  };

  const addLayer = (name, externalSource = null) => {
    const id = `layer-${Date.now()}`;
    const source = externalSource || new VectorSource();
    const layer = new VectorLayer({
      source,
      style: getDefaultStyleFunction(), // 🎯 Katman kendi stiline sahip
    });
  
    map?.addLayer(layer);
  
    const newLayer = {
      id,
      filename: name,
      source,
      layer,
      visible: true,
    };
  
    setUserLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(id);
    return newLayer;
  };
  /*
  const removeLayer = (layerId) => {
    const layerObj = userLayers.find(l => l.id === layerId);
    if (!layerObj) return;
  
    map?.removeLayer(layerObj.layer);
  
    setUserLayers(prev => prev.filter(l => l.id !== layerId));
  
    if (activeLayerId === layerId) {
      setActiveLayerId(null); // Aktifse sıfırla
    }
  };
  

  */

  const removeLayer = (layerId) => {
  const layerObj = userLayers.find(l => l.id === layerId);
  if (!layerObj) return;

  const featureCount = layerObj.source.getFeatures().length;

  // ❗ Kullanıcıya uyarı göster
  if (featureCount > 0) {
    const confirmDelete = window.confirm(
      `Bu katmanda ${featureCount} obje var. Silmek istediğinize emin misiniz?`
    );
    if (!confirmDelete) return;
  }

  map?.removeLayer(layerObj.layer);

  setUserLayers(prev => prev.filter(l => l.id !== layerId));

  if (activeLayerId === layerId) {
    setActiveLayerId(null); // Aktifse sıfırla
  }
};
  const zoomToLayer = (layerId) => {
    const userLayer = userLayers.find((l) => l.id === layerId);
    const layer = userLayer?.layer;
  
    if (layer && map) {
      const extent = layer.getSource().getExtent();
      if (extent) {
        map.getView().fit(extent, {
          duration: 500,
          padding: [20, 20, 20, 20],
          maxZoom: 18,
        });
      }
    }
  };
  return (
    <UserLayersContext.Provider
      value={{
        userLayers,
        activeLayerId,
        setActiveLayerId,
        addLayer,
        removeLayer,
        zoomToLayer,
        addFeatureToActiveLayer,
        getActiveLayer,
      }}
    >
      {children}
    </UserLayersContext.Provider>
  );
}

export function useUserLayers() {
  return useContext(UserLayersContext);
}