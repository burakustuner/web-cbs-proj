// src/contexts/UserLayersContext.js
import React, { createContext, useContext, useState } from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

const UserLayersContext = createContext();

export function UserLayersProvider({ children, map }) {
  const [userLayers, setUserLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

  const createDefaultLayer = () => {
    const source = new VectorSource();
    const layer = new VectorLayer({ source });
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

    layer.source.addFeature(feature);
  };

  const addLayer = (name, externalSource = null) => {
    const id = `layer-${Date.now()}`;
    const source = externalSource || new VectorSource();
    const layer = new VectorLayer({ source });
  
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