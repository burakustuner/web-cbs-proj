// src/contexts/UserLayersContext.js
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

const UserLayersContext = createContext();

export function UserLayersProvider({ children, map }) {
  const [userLayers, setUserLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const defaultLayerRef = useRef(null);

  // 🎨 Varsayılan stil fonksiyonu
  const getDefaultStyleFunction = useCallback(() => {
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
  }, []);

  const createDefaultLayer = useCallback(() => {
    const existingLayerInState = userLayers.find(l => l.id === 'default');
    if (existingLayerInState) {
        if (activeLayerId !== 'default') {
            setActiveLayerId('default');
        }
        return existingLayerInState;
    }

    if (defaultLayerRef.current) {
        return defaultLayerRef.current;
    }

    console.log("✨ Creating default layer...");
    const source = new VectorSource();
    const olLayer = new VectorLayer({
      source,
      style: getDefaultStyleFunction(),
    });
    map?.addLayer(olLayer);
    const newDefaultLayer = {
      id: 'default',
      name: 'Varsayılan',
      source,
      layer: olLayer,
      visible: true,
    };

    defaultLayerRef.current = newDefaultLayer;

    setUserLayers(prev => {
        if (prev.some(l => l.id === 'default')) {
            const layerFromState = prev.find(l => l.id === 'default');
            if (layerFromState) defaultLayerRef.current = layerFromState;
            return prev;
        }
        return [newDefaultLayer, ...prev];
    });
    setActiveLayerId('default');

    return newDefaultLayer;
  }, [map, userLayers, activeLayerId, getDefaultStyleFunction]);

  const getActiveLayer = useCallback(() => {
    if (!activeLayerId) return null;
    let layer = userLayers.find((l) => l.id === activeLayerId);
    if (!layer && activeLayerId === 'default' && defaultLayerRef.current?.id === 'default') {
        layer = defaultLayerRef.current;
    }
    return layer || null;
  }, [userLayers, activeLayerId]);

  const addFeatureToActiveLayer = useCallback((feature) => {
    console.log(`🟢 UserLayersContext: addFeatureToActiveLayer çağrıldı - Feature ID: ${feature.getId()}`);
    let layer = getActiveLayer();

    if (!layer) {
      layer = createDefaultLayer();
    }

    if (layer && layer.source && typeof layer.source.addFeature === 'function') {
      feature.setStyle(null);
      layer.source.addFeature(feature);
    } else {
      console.error("Hata: Özellik eklenemedi. Geçerli katman/kaynak bulunamadı.", { featureId: feature.getId(), targetLayer: layer });
    }
  }, [getActiveLayer, createDefaultLayer, activeLayerId]);

  const addLayer = useCallback((name, externalSource = null) => {
    const id = `layer-${Date.now()}`;
    const source = externalSource || new VectorSource();
    const layer = new VectorLayer({
      source,
      style: getDefaultStyleFunction(),
    });
  
    map?.addLayer(layer);
  
    const newLayer = {
      id,
      filename: name,
      name: name,
      source,
      layer,
      visible: true,
    };
  
    setUserLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(id);
    if (id === 'default' && defaultLayerRef.current) {
        defaultLayerRef.current = newLayer;
    }
    return newLayer;
  }, [map, getDefaultStyleFunction]);

  const renameLayer = useCallback((layerId, newName) => {
    setUserLayers((prevLayers) => {
      const updated = prevLayers.map((layer) => {
        const isMatch = layer.id === layerId;
        return isMatch ? { ...layer, filename: newName, name: newName } : layer;
      });
      return updated;
    });
    if (layerId === 'default' && defaultLayerRef.current) {
        defaultLayerRef.current = {...defaultLayerRef.current, filename: newName, name: newName};
    }
  }, []);

  const removeLayer = useCallback((layerId) => {
      const layerObj = userLayers.find(l => l.id === layerId);
      if (!layerObj) return;

      const featureCount = layerObj.source?.getFeatures()?.length || 0;

      if (featureCount > 0) {
          const confirmDelete = window.confirm(
              `Bu katmanda ${featureCount} obje var. Silmek istediğinize emin misiniz?`
          );
          if (!confirmDelete) return;
      }

      map?.removeLayer(layerObj.layer);

      setUserLayers(prev => {
          const remainingLayers = prev.filter(l => l.id !== layerId);
          if (layerId === 'default' && defaultLayerRef.current?.id === 'default') {
              defaultLayerRef.current = null;
          }
          return remainingLayers;
      });

      if (activeLayerId === layerId) {
          setActiveLayerId(prevActiveId => {
              const remainingLayersAfterRemove = userLayers.filter(l => l.id !== layerId);
              return remainingLayersAfterRemove.length > 0 ? remainingLayersAfterRemove[0].id : null;
          });
      }
  }, [map, userLayers, activeLayerId]);

  const zoomToLayer = useCallback((layerId) => {
    const userLayer = userLayers.find((l) => l.id === layerId);
    const layer = userLayer?.layer;
  
    if (layer && map && typeof layer.getSource === 'function') {
      const source = layer.getSource();
      if (source && typeof source.getExtent === 'function') {
          const extent = source.getExtent();
          if (extent && extent.every(isFinite) && extent.length === 4) {
              map.getView().fit(extent, {
                  duration: 500,
                  padding: [20, 20, 20, 20],
                  maxZoom: 18,
              });
          } else {
               console.warn(`zoomToLayer: Invalid or empty extent for layer ${layerId}`, extent);
          }
      }
    }
  }, [map, userLayers]);

  useEffect(() => {
      return () => {
          defaultLayerRef.current = null;
      };
  }, []);

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
        renameLayer
      }}
    >
      {children}
    </UserLayersContext.Provider>
  );
}

export function useUserLayers() {
  return useContext(UserLayersContext);
}