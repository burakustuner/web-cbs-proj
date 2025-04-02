import React from "react";
import { convertToGeoJSON } from "../../../utils/convertToGeoJSON";
import { useUserLayers } from "../../../contexts/UserLayersContext";
import GeoJSON from "ol/format/GeoJSON";
import { Vector as VectorSource } from "ol/source";

const GeoJSONImport = () => {
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

      // Yeni katman olarak ekle
      addLayer(file.name.replace(/\.(geo)?json$/, ""), source);

    } catch (error) {
      console.error("GeoJSON import hatası:", error);
      alert("Dosya yüklenemedi: " + error.message);
    }
  };

  return (
    <div style={{ padding: "5px" }}>
      <label htmlFor="geojson-input" className="toolbar-button">
        GeoJSON Seç
      </label>
      <input
        id="geojson-input"
        type="file"
        accept=".geojson,.json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default GeoJSONImport;
