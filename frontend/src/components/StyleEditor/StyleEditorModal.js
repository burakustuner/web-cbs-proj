import React, { useState } from 'react';
import { useEffect } from 'react';
import './StyleEditorModal.css';
import { applyUserStyleToLayer } from './../../layers/UserLayers';

function StyleEditorModal({ layerKey, onClose, onSave, userLayers }) {
  const [activeTab, setActiveTab] = useState('point');
  const [styles, setStyles] = useState({
    point: { color: '#ff0000', radius: 6 },
    line: { color: '#0000ff', width: 2 },
    polygon: { strokeColor: '#00ff00', fillColor: '#00ff0055' }
  });

  useEffect(() => {
    const target = userLayers.find(layer => layer.filename === layerKey || `user-${layer.id}` === layerKey);
    if (!target) return;
  
    const feature = target.layer.getSource().getFeatures()[0];
    if (!feature) return;
  
    const styleFunc = target.layer.getStyle();
    if (!styleFunc || typeof styleFunc !== 'function') return;
  
    const style = styleFunc(feature);
    const geometryType = feature.getGeometry().getType();
  
    if ((geometryType === 'Point' || geometryType === 'MultiPoint') && style.getImage()) {
      const image = style.getImage();
      setStyles(prev => ({
        ...prev,
        point: {
          color: image.getFill().getColor(),
          radius: image.getRadius()
        }
      }));
    }
  
    if ((geometryType === 'LineString' || geometryType === 'MultiLineString') && style.getStroke()) {
      const stroke = style.getStroke();
      setStyles(prev => ({
        ...prev,
        line: {
          color: stroke.getColor(),
          width: stroke.getWidth()
        }
      }));
    }
  
    if ((geometryType === 'Polygon' || geometryType === 'MultiPolygon')) {
      const stroke = style.getStroke();
      const fill = style.getFill();
      setStyles(prev => ({
        ...prev,
        polygon: {
          strokeColor: stroke?.getColor() || '#000000',
          fillColor: fill?.getColor() || '#00000033'
        }
      }));
    }
  
  }, [layerKey, userLayers]);

  const handleChange = (geomType, prop, value) => {
    setStyles(prev => ({
      ...prev,
      [geomType]: {
        ...prev[geomType],
        [prop]: value
      }
    }));
  };

  const handleSave = () => {
    const target = userLayers.find(layer => layer.filename === layerKey || `user-${layer.id}` === layerKey);

    console.log('[StyleEditor] Aktif layerKey:', layerKey);
    console.log('[StyleEditor] Kaydedilen stil:', styles);
    console.log('[StyleEditor] Hedef katman:', target);

    if (target) {
      applyUserStyleToLayer(target.layer, styles);
    }
    onSave(layerKey, styles);
    onClose();
  };

  return (
    <div className="style-editor-modal">
      <div className="modal-content">
        <h2>Stil Ayarları - {layerKey}</h2>
        <div className="tabs">
          <button onClick={() => setActiveTab('point')} className={activeTab === 'point' ? 'active' : ''}>Nokta</button>
          <button onClick={() => setActiveTab('line')} className={activeTab === 'line' ? 'active' : ''}>Çizgi</button>
          <button onClick={() => setActiveTab('polygon')} className={activeTab === 'polygon' ? 'active' : ''}>Alan</button>
        </div>

        <div className="tab-panel">
          {activeTab === 'point' && (
            <div>
              <label>Renk: <input type="color" value={styles.point.color} onChange={(e) => handleChange('point', 'color', e.target.value)} /></label>
              <label>Yarıçap: <input type="number" value={styles.point.radius} onChange={(e) => handleChange('point', 'radius', parseInt(e.target.value))} /></label>
            </div>
          )}

          {activeTab === 'line' && (
            <div>
              <label>Renk: <input type="color" value={styles.line.color} onChange={(e) => handleChange('line', 'color', e.target.value)} /></label>
              <label>Çizgi Kalınlığı: <input type="number" value={styles.line.width} onChange={(e) => handleChange('line', 'width', parseInt(e.target.value))} /></label>
            </div>
          )}

          {activeTab === 'polygon' && (
            <div>
              <label>Kenarlık Rengi: <input type="color" value={styles.polygon.strokeColor} onChange={(e) => handleChange('polygon', 'strokeColor', e.target.value)} /></label>
              <label>Dolgu Rengi: <input type="color" value={styles.polygon.fillColor} onChange={(e) => handleChange('polygon', 'fillColor', e.target.value)} /></label>
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={handleSave}>Kaydet</button>
          <button onClick={onClose}>İptal</button>
        </div>
      </div>
    </div>
  );
}

export default StyleEditorModal;
