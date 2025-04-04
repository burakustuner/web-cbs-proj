import React, { useState, useEffect } from 'react';
import { Select, Draw } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { Polygon } from 'ol/geom';
import { platformModifierKeyOnly } from 'ol/events/condition';
import { useToolManager } from '../../../contexts/ToolManagerContext';
import { useUserLayers } from '../../../contexts/UserLayersContext';

function DeleteFeatures({ map }) {
  const { openTool, closeTool, isToolActive } = useToolManager();
  const { userLayers } = useUserLayers();// Aktif katmanları alıyoruz

  const [mode, setMode] = useState(null); // 'single' | 'area' | 'all'

  useEffect(() => {
    if (!map || !isToolActive('delete-features') || !mode) return;
  
    let interaction;
  
    if (mode === 'single') {
      const select = new Select(); // OpenLayers'ın seçme aracı
      interaction = select;
  
      // Event listener: kullanıcı bir feature seçtiğinde tetiklenir
      select.getFeatures().on('add', (e) => {
        const feature = e.element;
        const featureId = feature.getId?.();
        console.log('✅ Feature seçildi. ID:', featureId);
        console.log('🔎 userLayers:', userLayers);

        for (const [index, userLayer] of userLayers.entries()) {
             // 🔒 Yalnızca görünür katmanlarda çalış
             if (!userLayer.layer?.getVisible?.()) continue;
            const source = userLayer.source;
            if (!source) {
              console.warn(`⛔ Katman "${userLayer.name || userLayer.id}" kaynak içermiyor.`);
              continue;
            }
          
            const features = source.getFeatures?.();
            console.log('🔍 Katmandaki ID\'ler:', features.map(f => f.getId?.()));
            if (!features || features.length === 0) {
              console.warn(`⚠️ Katman "${userLayer.name || userLayer.id}" içinde feature yok.`);
              continue;
            }
          
            const match = features.find(f => f.getId?.() === featureId);
          
            if (match) {
              console.log(`🧨 Eşleşen feature bulundu! Katman: "${userLayer.name}"`);
              console.log('🎯 Select koleksiyonu (önce):', select.getFeatures().getArray());
                select.getFeatures().remove(match);
                select.getFeatures().clear();
                console.log('🧹 Select koleksiyonu (sonra):', select.getFeatures().getArray());

              source.removeFeature(match);
              select.getFeatures().remove(match); // 👈 mavi seçimi kaldır
                select.getFeatures().clear();       // 👈 her ihtimale karşı tamamen temizle
              console.log('🗑️ Feature başarıyla silindi.');
              break;
            } else {
              console.log(`❌ Katman "${userLayer.name}" içinde eşleşen ID bulunamadı.`);
            }
          }
      
        select.getFeatures().clear();
      });
      
      
  
      map.addInteraction(select);
      console.log('🎯 Select interaction eklendi.');
    }
    else if (mode === 'area') {
        const draw = new Draw({
          source: null, // geçici source yok
          type: 'Polygon',
        });
        interaction = draw;
      
        draw.on('drawend', (event) => {
            const polygon = event.feature.getGeometry();
            let totalDeleted = 0;
          
            // Önce silinecek feature’ları topla (silme değil!)
            const featuresToDelete = [];
          
            for (const userLayer of userLayers || []) {
              if (!userLayer.layer?.getVisible?.()) continue;
          
              const source = userLayer.source;
              if (!source) continue;
          
              const features = source.getFeatures?.();
              if (!features) continue;
          
              for (const feature of features) {
                const geometry = feature.getGeometry();
                if (geometry && polygon.intersectsExtent(geometry.getExtent())) {
                  featuresToDelete.push({ source, feature });
                }
              }
            }
          
            if (featuresToDelete.length === 0) {
              alert("Alan içinde silinecek obje bulunamadı.");
              return;
            }
          
            const confirm = window.confirm(
              `Bu alan içinde ${featuresToDelete.length} obje bulunuyor. Silmek istiyor musunuz?`
            );
          
            if (!confirm) return;
          
            // Şimdi silme işlemini uygula
            for (const { source, feature } of featuresToDelete) {
              source.removeFeature(feature);
              totalDeleted++;
            }
          
            console.log(`🟪 Alanla silinen obje sayısı: ${totalDeleted}`);
          });
          
        map.addInteraction(draw);
        console.log('🟪 Polygon draw interaction eklendi.');
      }
      else if (mode === 'all') {
        let total = 0;
      
        for (const userLayer of userLayers || []) {
          if (!userLayer.layer?.getVisible?.()) continue;
          const source = userLayer.source;
          if (!source || typeof source.getFeatures !== 'function') continue;
          total += source.getFeatures().length;
        }
      
        if (total === 0) {
          alert("Silinecek obje bulunamadı.");
          setMode(null);
          return;
        }
      
        const confirm = window.confirm(
          `Toplam ${total} görünür obje silinecek. Devam etmek istiyor musunuz?`
        );
      
        if (!confirm) {
          setMode(null);
          return;
        }
      
        for (const userLayer of userLayers || []) {
          if (!userLayer.layer?.getVisible?.()) continue;
          const source = userLayer.source;
          if (!source || typeof source.clear !== 'function') continue;
          source.clear();
        }
      
        console.log(`🧹 ${total} obje temizlendi.`);
        setMode(null);
      }
      
        
    // Cleanup — interaction kaldır
    return () => {
      if (interaction) {
        map.removeInteraction(interaction);
        console.log('🧹 Select interaction kaldırıldı.');
      }
    };
  }, [map, isToolActive('delete-features'), mode, userLayers]);
  

  const handleClick = () => {
    if (isToolActive('delete-features')) {
      closeTool('delete-features');
      setMode(null);
    } else {
      openTool({
        id: 'delete-features',
        title: 'Delete',
        singleton: true,
        canWorkTogether: false,
        render: () => <DeleteFeatures map={map} />
      });
    }
  };

  return (
    <div style={{ padding: "5px" }}>
      <button className="toolbar-button" onClick={handleClick}>
        {isToolActive('delete-features') ? '🗑️ Deletion Active' : '🗑️ Delete'}
      </button>

      {isToolActive('delete-features') && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => setMode('single')}>🖱️ Delete Selection</button>
          <button onClick={() => setMode('area')}>🟪 Delete by Area</button>
          <button onClick={() => setMode('all')}>🧹 Delete All</button>
        </div>
      )}
    </div>
  );
}

export default DeleteFeatures;
