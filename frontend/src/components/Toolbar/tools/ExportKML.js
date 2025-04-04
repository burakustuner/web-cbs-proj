import React, { useState } from 'react';
import { useUserLayers } from '../../../contexts/UserLayersContext';
import KML from 'ol/format/KML';

function ExportKML() {
  const { userLayers } = useUserLayers();
  const [expanded, setExpanded] = useState(false);

  const exportKML = (layer) => {
    const features = layer.source.getFeatures();
    if (!features.length) return alert('Katmanda hiç obje yok.');

    const kml = new KML().writeFeatures(features, {
      featureProjection: 'EPSG:3857',
    });

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.filename || 'export'}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllVisibleLayers = () => {
    let allFeatures = [];

    userLayers.forEach((layer) => {
      if (!layer.layer?.getVisible?.()) return;

      const features = layer.source.getFeatures();
      if (!features.length) return;

      allFeatures = allFeatures.concat(features);
    });

    if (!allFeatures.length) {
      alert('Hiçbir görünür katmanda obje yok.');
      return;
    }

    const kml = new KML().writeFeatures(allFeatures, {
      featureProjection: 'EPSG:3857',
    });

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `tum-katmanlar.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      padding: '8px',
      minWidth: '200px'
    }}>
      <button
        className="toolbar-button"
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}
      >
        <span>📄 KML Dışa Aktar</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button className="toolbar-button" onClick={exportAllVisibleLayers}>
            💾 Tüm Görünür Öğeleri Kaydet
          </button>

          <hr />

          {userLayers.length === 0 && <p style={{ fontStyle: 'italic', color: '#888' }}>Hiç katman yok.</p>}

          {userLayers.map((layer) => (
            <div key={layer.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9em' }}>{layer.filename || layer.id}</span>
              <button className="toolbar-button" onClick={() => exportKML(layer)}>💾</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportKML;
