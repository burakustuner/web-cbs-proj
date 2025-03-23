import React from "react";
import { convertToGeoJSON } from "../../../utils/convertToGeoJSON";

const GeoJSONImport = ({ onImport }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const geojson = await convertToGeoJSON(file);

      // Dosya adı ve veriyi dışarı gönderiyoruz
      onImport({
        filename: file.name,
        data: geojson,
      });

      alert("GeoJSON başarıyla yüklendi.");
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
