import React, { useState, useEffect } from 'react';
import './StyleEditorModal.css';
import { applyUserStyleToLayer } from '../../layers/UserLayers';
import { Rnd } from 'react-rnd';

function rgbaToHex(rgba) {
  const parts = rgba.match(/rgba?\((\d+), ?(\d+), ?(\d+),? ?([\d.]*)?\)/);
  if (!parts) return '#000000';

  const r = parseInt(parts[1]).toString(16).padStart(2, '0');
  const g = parseInt(parts[2]).toString(16).padStart(2, '0');
  const b = parseInt(parts[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function StyleEditorModal({ layerKey, onClose, onSave, userLayers }) {
  const [activeTab, setActiveTab] = useState('point');
  
  const [styles, setStyles] = useState({
    point: {
      color: '#ff0000',
      radius: 6,
      strokeColor: '#ffffff',
      strokeWidth: 1,
    },
    line: {
      color: '#0000ff',
      width: 2,
      dash: '',
      opacity: 1,
      cap: 'round',
    },
    polygon: {
      strokeColor: '#00ff00',
      fillColor: '#00ff0055',
      strokeWidth: 2,
      strokeDash: '',
      fillOpacity: 0.3,
    },
  });

  const handleChange = (geomType, prop, value) => {
    setStyles(prev => ({
      ...prev,
      [geomType]: {
        ...prev[geomType],
        [prop]: value,
      }
    }));
  };
  const [targetLayer, setTargetLayer] = useState(null);
  useEffect(() => {
    const target = userLayers.find(layer => layer.filename === layerKey || `user-${layer.id}` === layerKey);
    if (!target) return;
  
    setTargetLayer(target); // 👈 bunu ekledik

    const features = target.layer.getSource().getFeatures();
    const getFeatureByType = (type) => features.find(f => f.getGeometry().getType() === type);
  
    const styleFunc = target.layer.getStyle();
  
    // Nokta
    const pointFeature = getFeatureByType('Point') || getFeatureByType('MultiPoint');
    if (pointFeature && styleFunc) {
      const style = styleFunc(pointFeature);
      const image = style.getImage();
      setStyles(prev => ({
        ...prev,
        point: {
          color: image?.getFill()?.getColor() || '#ff0000',
          radius: image?.getRadius() || 6,
          strokeColor: image?.getStroke()?.getColor() || '#ffffff',
          strokeWidth: image?.getStroke()?.getWidth() || 1,
        },
      }));
    }
  
    // Çizgi
    const lineFeature = getFeatureByType('LineString') || getFeatureByType('MultiLineString');
    if (lineFeature && styleFunc) {
      const style = styleFunc(lineFeature);
      const stroke = style.getStroke();
      setStyles(prev => ({
        ...prev,
        line: {
          color: stroke?.getColor() || '#0000ff',
          width: stroke?.getWidth() || 2,
          dash: (stroke?.getLineDash() || []).join(','),
          opacity: 1, // OpenLayers'ta stroke opacity ayrı verilmediği için bu sabit kalabilir
          cap: stroke?.getLineCap() || 'round',
        },
      }));
    }
  
    // Poligon
    const polygonFeature = getFeatureByType('Polygon') || getFeatureByType('MultiPolygon');
    if (polygonFeature && styleFunc) {
      const style = styleFunc(polygonFeature);
      const stroke = style.getStroke();
      const fill = style.getFill();
      const fillColor = fill?.getColor();
  
      let hex = '#00ff00';
      let opacity = 0.3;
  
      if (typeof fillColor === 'string' && fillColor.startsWith('rgba')) {
        hex = rgbaToHex(fillColor);
        const matches = fillColor.match(/rgba?\(\d+, \d+, \d+, ([\d\.]+)\)/);
        if (matches) {
          opacity = parseFloat(matches[1]);
        }
      } else if (typeof fillColor === 'string' && fillColor.startsWith('#')) {
        hex = fillColor;
      }
      setStyles(prev => ({
        ...prev,
        polygon: {
          strokeColor: stroke?.getColor() || '#00ff00',
          strokeWidth: stroke?.getWidth() || 2,
          strokeDash: (stroke?.getLineDash() || []).join(','),
          fillColor: hex,
          fillOpacity: opacity,
        },
      }));
    }
  
  }, [layerKey, userLayers]);
  

  const handleSave = () => {
    const target = userLayers.find(layer => layer.filename === layerKey || `user-${layer.id}` === layerKey);
    if (target) {
      applyUserStyleToLayer(target.layer, styles);
    }
    //onSave(layerKey, styles);
    onClose();
  };

  return (
    <div className="style-editor-modal">
      <div className="modal-content">
        <h2>Stil Ayarları - {targetLayer?.filename || layerKey}</h2>
        <div className="tabs">
          <button onClick={() => setActiveTab('point')} className={activeTab === 'point' ? 'active' : ''}>Nokta</button>
          <button onClick={() => setActiveTab('line')} className={activeTab === 'line' ? 'active' : ''}>Çizgi</button>
          <button onClick={() => setActiveTab('polygon')} className={activeTab === 'polygon' ? 'active' : ''}>Alan</button>
        </div>

        <div className="tab-panel">
          {activeTab === 'point' && (
            <div>
              <label>Renk: <input type="color" value={styles.point.color} onChange={(e) => handleChange('point', 'color', e.target.value)} /></label>
              <label>Yarıçap: <input type="number" value={styles.point.radius} onChange={(e) => handleChange('point', 'radius', parseFloat(e.target.value))} /></label>
              <label>Kenarlık Rengi: <input type="color" value={styles.point.strokeColor} onChange={(e) => handleChange('point', 'strokeColor', e.target.value)} /></label>
              <label>Kenarlık Kalınlığı: <input type="number" value={styles.point.strokeWidth} onChange={(e) => handleChange('point', 'strokeWidth', parseFloat(e.target.value))} /></label>
            </div>
          )}

          {activeTab === 'line' && (
            <div>
              <label>Renk: <input type="color" value={styles.line.color} onChange={(e) => handleChange('line', 'color', e.target.value)} /></label>
              <label>Kalınlık: <input type="number" value={styles.line.width} onChange={(e) => handleChange('line', 'width', parseFloat(e.target.value))} /></label>
              <label>Kesikli Çizgi (örn: 4,4): <input type="text" value={styles.line.dash} onChange={(e) => handleChange('line', 'dash', e.target.value)} /></label>
              <label>Saydamlık: <input type="range" min="0" max="1" step="0.1" value={styles.line.opacity} onChange={(e) => handleChange('line', 'opacity', parseFloat(e.target.value))} /></label>
              <label>Uç Tipi:
                <select value={styles.line.cap} onChange={(e) => handleChange('line', 'cap', e.target.value)}>
                  <option value="round">Yuvarlak</option>
                  <option value="square">Kare</option>
                  <option value="butt">Düz</option>
                </select>
              </label>
            </div>
          )}

          {activeTab === 'polygon' && (
            <div>
              <label>Dolgu Rengi: <input type="color" value={styles.polygon.fillColor} onChange={(e) => handleChange('polygon', 'fillColor', e.target.value)} /></label>
              <label>Dolgu Saydamlığı: <input type="range" min="0" max="1" step="0.1" value={styles.polygon.fillOpacity} onChange={(e) => handleChange('polygon', 'fillOpacity', parseFloat(e.target.value))} /></label>
              <label>Kenarlık Rengi: <input type="color" value={styles.polygon.strokeColor} onChange={(e) => handleChange('polygon', 'strokeColor', e.target.value)} /></label>
              <label>Kenarlık Kalınlığı: <input type="number" value={styles.polygon.strokeWidth} onChange={(e) => handleChange('polygon', 'strokeWidth', parseFloat(e.target.value))} /></label>
              <label>Kesikli Kenar (örn: 4,2): <input type="text" value={styles.polygon.strokeDash} onChange={(e) => handleChange('polygon', 'strokeDash', e.target.value)} /></label>
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
