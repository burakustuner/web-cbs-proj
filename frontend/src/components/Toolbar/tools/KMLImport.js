// src/components/Toolbar/tools/KMLImport.js

import React from "react";
import { convertToGeoJSON } from "../../../utils/convertToGeoJSON";
import { useUserLayers } from "../../../contexts/UserLayersContext";
import GeoJSON from "ol/format/GeoJSON";
import { Vector as VectorSource } from "ol/source";

const KMLImport = () => {
  const { addLayer } = useUserLayers();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const geojson = await convertToGeoJSON(file);

      const source = new VectorSource({
        features: new GeoJSON().readFeatures(geojson, {
          featureProjection: "EPSG:3857",
        }),
      });

      addLayer(file.name.replace(/\.kml$/, ""), source);

    } catch (error) {
      console.error("KML import hatası:", error);
      alert("Dosya yüklenemedi: " + error.message);
    }
  };

  return (
    <div style={{ padding: "5px" }}>
      <label htmlFor="kml-input" className="toolbar-button">
        KML Seç
      </label>
      <input
        id="kml-input"
        type="file"
        accept=".kml"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default KMLImport;
