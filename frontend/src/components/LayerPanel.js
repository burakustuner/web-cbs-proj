import React, { useState } from 'react';

function LayerPanel({ showCities, setShowCities, showRoads, setShowRoads, showRegions, setShowRegions }) {
  const [showExampleGroup, setShowExampleGroup] = useState(true);
  const [showSystemLayers, setShowSystemLayers] = useState(true);
  const [showUserLayers, setShowUserLayers] = useState(true);

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'white',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000,
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      maxWidth: '300px',
      fontSize: '14px'
    }}>
      {/* Örnek Katmanlar */}
      <div>
        <div
          style={{ cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => setShowExampleGroup(!showExampleGroup)}
        >
          {showExampleGroup ? '📂' : '📁'} Örnek Katmanlar
        </div>

        {showExampleGroup && (
          <div style={{ marginLeft: '15px' }}>
            <div
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setShowSystemLayers(!showSystemLayers)}
            >
              {showSystemLayers ? '📂' : '📁'} Sistem Katmanları
            </div>

            {showSystemLayers && (
              <div style={{ marginLeft: '15px' }}>
                <label>
                  <input type="checkbox" checked={showCities} onChange={() => setShowCities(!showCities)} />
                  Şehirler
                </label><br />
                <label>
                  <input type="checkbox" checked={showRoads} onChange={() => setShowRoads(!showRoads)} />
                  Yollar
                </label><br />
                <label>
                  <input type="checkbox" checked={showRegions} onChange={() => setShowRegions(!showRegions)} />
                  Bölgeler
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kullanıcı Tabakaları */}
      <div style={{ marginTop: '10px' }}>
        <div
          style={{ cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => setShowUserLayers(!showUserLayers)}
        >
          {showUserLayers ? '📂' : '📁'} Kullanıcı Tabakaları
        </div>

        {showUserLayers && (
          <div style={{ marginLeft: '15px', fontStyle: 'italic', color: '#888' }}>
            (Henüz veri yok)
          </div>
        )}
      </div>
    </div>
  );
}

export default LayerPanel;
