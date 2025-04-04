  import React, { useState } from 'react';
  import * as Toolbar from '@radix-ui/react-toolbar';
  import './Toolbar.css';
  import GeoJSONImport from './tools/GeoJSONImport';
  import KMLImport from './tools/KMLImport';
  import EditStyle from './tools/EditStyle';
  import DrawPoint from './tools/DrawPoint';
  import DrawLine from './tools/DrawLine';
  import DrawPolygon from './tools/DrawPolygon';
  import EditGeometry from './tools/EditGeometry';
  import DeleteFeatures from './tools/DeleteFeatures';
  import ExportGeoJSON from './tools/ExportGeoJSON';
  import ExportKML from './tools/ExportKML';
  
  function CustomToolbar({map, onImportKML, onImportGeoJSON }) {
    const [activeTool, setActiveTool] = useState(null);

    return (
      <div className="toolbar-wrapper">
        <Toolbar.Root className="toolbar-root" aria-label="Toolbar demo">
        <Toolbar.Button
            className="toolbar-button"
            onClick={() => setActiveTool(activeTool === 'drawing' ? null : 'drawing')}
          >
            📤 Drawing Tools
          </Toolbar.Button>

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
              <KMLImport />
              <button onClick={onImportKML}>📄 KML/KMZ Import</button>
            </>
          )}

          {activeTool === 'drawing' && (
            <>
            <DrawPoint map={map} />
            <DrawLine map={map} />
            <DrawPolygon map={map} />
              <EditStyle map={map} />
              <EditGeometry map={map} />
              <DeleteFeatures map={map} />
              
            </>
          )}

          {activeTool === 'export' && (
            <>
            <ExportGeoJSON />
            <ExportKML />

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
