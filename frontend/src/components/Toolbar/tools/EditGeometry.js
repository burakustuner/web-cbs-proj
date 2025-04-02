import React, { useEffect } from 'react';
import { Select, Modify } from 'ol/interaction';
import { useToolManager } from '../../../contexts/ToolManagerContext';

function EditGeometry({ map }) {
  const { openTool, closeTool, isToolActive } = useToolManager();

  useEffect(() => {
    if (!map || !isToolActive('edit-geometry')) return;

    const select = new Select();
    const modify = new Modify({ features: select.getFeatures() });

    map.addInteraction(select);
    map.addInteraction(modify);

    // 👇 Temizlik kısmı — işte burası!
    return () => {
      map.removeInteraction(select);
      map.removeInteraction(modify);
      select.getFeatures().clear(); // ✅ Seçimi sıfırla
    };
  }, [map, isToolActive('edit-geometry')]);

  return (
    <div style={{ padding: "5px" }}>
      <button
        className="toolbar-button"
        onClick={() => {
          if (isToolActive('edit-geometry')) {
            closeTool('edit-geometry');
          } else {
            openTool({
              id: 'edit-geometry',
              title: 'Geometri Düzenle',
              singleton: true,
              canWorkTogether: false,
              render: () => <EditGeometry map={map} />
            });
          }
        }}
      >
        {isToolActive('edit-geometry') ? '✔️ Geometri Aktif' : '✏️ Geometri Düzenle'}
      </button>
    </div>
  );
}

export default EditGeometry;
