import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import API_BASE_URL from './config';
import LayerPanel from './components/LayerPanel';

import { createCitiesLayer } from './layers/CitiesLayer';
import { createRoadsLayer } from './layers/RoadsLayer';
import { createRegionsLayer } from './layers/RegionsLayer';

function App() {
  const mapRef = useRef();
  const popupRef = useRef();
  const [citiesLayer, setCitiesLayer] = useState(null);
  const [roadsLayer, setRoadsLayer] = useState(null);
  const [regionsLayer, setRegionsLayer] = useState(null);

  const [showCities, setShowCities] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showRegions, setShowRegions] = useState(true);

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

    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });
    mapObject.addOverlay(overlay);

    // Şehirler
    fetch(`${API_BASE_URL}/cities`)
      .then(res => res.json())
      .then(data => {
        const layer = createCitiesLayer(data);
        mapObject.addLayer(layer);
        setCitiesLayer(layer);

        mapObject.on('click', function (evt) {
          const feature = mapObject.forEachFeatureAtPixel(evt.pixel, feat => feat);
          if (feature) {
            const props = feature.getProperties();
            const coordinates = feature.getGeometry().getCoordinates();
            overlay.setPosition(coordinates);
            popupRef.current.innerHTML = `
              <div style="background:white;padding:5px;border-radius:4px;">
                <strong>${props.name}</strong><br/>
                Nüfus: ${props.population ? props.population.toLocaleString() : 'Bilinmiyor'}
              </div>
            `;
          } else {
            popupRef.current.innerHTML = '';
          }
        });
      })
      .catch(err => console.error('Şehir verisi alınamadı:', err));

    // Yollar
    fetch(`${API_BASE_URL}/roads`)
      .then(res => res.json())
      .then(data => {
        const layer = createRoadsLayer(data);
        mapObject.addLayer(layer);
        setRoadsLayer(layer);
      })
      .catch(err => console.error('Yol verisi alınamadı:', err));

    // Bölgeler
    fetch(`${API_BASE_URL}/regions`)
      .then(res => res.json())
      .then(data => {
        const layer = createRegionsLayer(data);
        mapObject.addLayer(layer);
        setRegionsLayer(layer);
      })
      .catch(err => console.error('Bölge verisi alınamadı:', err));
  }, []);

  // Görünürlük kontrolleri
  useEffect(() => { if (citiesLayer) citiesLayer.setVisible(showCities); }, [showCities, citiesLayer]);
  useEffect(() => { if (roadsLayer) roadsLayer.setVisible(showRoads); }, [showRoads, roadsLayer]);
  useEffect(() => { if (regionsLayer) regionsLayer.setVisible(showRegions); }, [showRegions, regionsLayer]);

  return (
    <>
      <LayerPanel
        showCities={showCities}
        setShowCities={setShowCities}
        showRoads={showRoads}
        setShowRoads={setShowRoads}
        showRegions={showRegions}
        setShowRegions={setShowRegions}
      />

      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
      <div ref={popupRef} className="ol-popup"></div>
    </>
  );
}

export default App;
