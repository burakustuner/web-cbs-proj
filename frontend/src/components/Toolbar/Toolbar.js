import React, { useState } from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import './Toolbar.css';
import GeoJSONImport from './tools/GeoJSONImport';

function CustomToolbar({ onImportKML, onImportGeoJSON }) {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="toolbar-wrapper">
      <Toolbar.Root className="toolbar-root" aria-label="Toolbar demo">
        <Toolbar.Button
          className="toolbar-button"
          onClick={() => setActiveTool(activeTool === 'import' ? null : 'import')}
        >
          📂 Veri Import
        </Toolbar.Button>

        <Toolbar.Button
          className="toolbar-button"
          onClick={() => setActiveTool(activeTool === 'export' ? null : 'export')}
        >
          📤 Veri Export
        </Toolbar.Button>

        <Toolbar.Button
          className="toolbar-button"
          onClick={() => setActiveTool(activeTool === 'print' ? null : 'print')}
        >
          🖨️ Çıktı Al
        </Toolbar.Button>
      </Toolbar.Root>

      {/* Alt araç çubuğu */}
      <div className="sub-toolbar">
        {activeTool === 'import' && (
          <>
            <GeoJSONImport onImport={onImportGeoJSON} />
            <button onClick={onImportKML}>📄 KML/KMZ Import</button>
          </>
        )}

        {activeTool === 'export' && (
          <>
            <button onClick={() => alert("GeoJSON Export")}>🌍 GeoJSON Export</button>
            <button onClick={() => alert("KML Export")}>📄 KML Export</button>
          </>
        )}

        {activeTool === 'print' && (
          <>
            <button onClick={() => alert("PDF Al")}>🖨️ PDF Al</button>
            <button onClick={() => alert("PNG Al")}>🖼️ PNG Al</button>
          </>
        )}
      </div>
    </div>
  );
}

export default CustomToolbar;
