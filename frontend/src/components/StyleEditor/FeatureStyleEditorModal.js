import React, { useState, useEffect } from 'react';
import './StyleEditorModal.css';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import ModalWindow from '../ui/ModalWindow';

function rgbaToHex(rgba) {
  const parts = rgba?.match(/rgba?\((\d+), ?(\d+), ?(\d+),? ?([\d.]*)?\)/);
  if (!parts) return '#00ff00';
  const r = parseInt(parts[1]).toString(16).padStart(2, '0');
  const g = parseInt(parts[2]).toString(16).padStart(2, '0');
  const b = parseInt(parts[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function FeatureStyleEditorModal({ feature, onClose }) {
  const [geometryType, setGeometryType] = useState(null);

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
      fillColor: '#00ff00',
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

  useEffect(() => {
    const geomType = feature.getGeometry().getType();
    if (geomType.includes('Point')) setGeometryType('point');
    else if (geomType.includes('LineString')) setGeometryType('line');
    else if (geomType.includes('Polygon')) setGeometryType('polygon');

    const style = feature.getStyle?.() || feature._customStyle;
    if (!style) return;

    if (geomType.includes('Point')) {
      const image = style.getImage?.();
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

    if (geomType.includes('LineString')) {
      const stroke = style.getStroke?.();
      setStyles(prev => ({
        ...prev,
        line: {
          color: stroke?.getColor() || '#0000ff',
          width: stroke?.getWidth() || 2,
          dash: (stroke?.getLineDash() || []).join(','),
          opacity: 1,
          cap: stroke?.getLineCap() || 'round',
        },
      }));
    }

    if (geomType.includes('Polygon')) {
      const stroke = style.getStroke?.();
      const fill = style.getFill?.();
      const fillColor = fill?.getColor();

      let hex = '#00ff00';
      let opacity = 0.3;

      if (typeof fillColor === 'string') {
        if (fillColor.startsWith('rgba')) {
          hex = rgbaToHex(fillColor);
          const match = fillColor.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
          if (match) opacity = parseFloat(match[1]);
        } else if (fillColor.startsWith('#')) {
          hex = fillColor;
          opacity = 1;
        }
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
  }, [feature]);

  const handleSave = () => {
    const type = geometryType;
    let style = null;

    if (type === 'point') {
      style = new Style({
        image: new CircleStyle({
          radius: styles.point.radius,
          fill: new Fill({ color: styles.point.color }),
          stroke: new Stroke({
            color: styles.point.strokeColor,
            width: styles.point.strokeWidth,
          }),
        }),
      });
    }

    if (type === 'line') {
      style = new Style({
        stroke: new Stroke({
          color: styles.line.color,
          width: styles.line.width,
          lineDash: styles.line.dash.split(',').map(n => parseFloat(n)),
          lineCap: styles.line.cap,
        }),
      });
    }

    if (type === 'polygon') {
      const hex = styles.polygon.fillColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgba = `rgba(${r},${g},${b},${styles.polygon.fillOpacity})`;

      style = new Style({
        stroke: new Stroke({
          color: styles.polygon.strokeColor,
          width: styles.polygon.strokeWidth,
          lineDash: styles.polygon.strokeDash.split(',').map(n => parseFloat(n)),
        }),
        fill: new Fill({ color: rgba }),
      });
    }

    feature._customStyle = style;
    feature.setStyle(style);
    onClose();
  };

  return (
    <ModalWindow id="feature-style-editor" title="Stil Düzenleyici" onClose={onClose}>

      <h2>
        {geometryType === 'point' && 'Nokta Stili'}
        {geometryType === 'line' && 'Çizgi Stili'}
        {geometryType === 'polygon' && 'Alan Stili'}
      </h2>

      <div className="tab-panel">
        {geometryType === 'point' && (
          <div>
            <label>Renk: <input type="color" value={styles.point.color} onChange={(e) => handleChange('point', 'color', e.target.value)} /></label>
            <label>Yarıçap: <input type="number" value={styles.point.radius} onChange={(e) => handleChange('point', 'radius', parseFloat(e.target.value))} /></label>
            <label>Kenarlık Rengi: <input type="color" value={styles.point.strokeColor} onChange={(e) => handleChange('point', 'strokeColor', e.target.value)} /></label>
            <label>Kenarlık Kalınlığı: <input type="number" value={styles.point.strokeWidth} onChange={(e) => handleChange('point', 'strokeWidth', parseFloat(e.target.value))} /></label>
          </div>
        )}

        {geometryType === 'line' && (
          <div>
            <label>Renk: <input type="color" value={styles.line.color} onChange={(e) => handleChange('line', 'color', e.target.value)} /></label>
            <label>Kalınlık: <input type="number" value={styles.line.width} onChange={(e) => handleChange('line', 'width', parseFloat(e.target.value))} /></label>
            <label>Kesikli Çizgi: <input type="text" value={styles.line.dash} onChange={(e) => handleChange('line', 'dash', e.target.value)} /></label>
            <label>Uç Tipi:
              <select value={styles.line.cap} onChange={(e) => handleChange('line', 'cap', e.target.value)}>
                <option value="round">Yuvarlak</option>
                <option value="square">Kare</option>
                <option value="butt">Düz</option>
              </select>
            </label>
          </div>
        )}

        {geometryType === 'polygon' && (
          <div>
            <label>Dolgu Rengi: <input type="color" value={styles.polygon.fillColor} onChange={(e) => handleChange('polygon', 'fillColor', e.target.value)} /></label>
            <label>Dolgu Saydamlığı: <input type="range" min="0" max="1" step="0.1" value={styles.polygon.fillOpacity} onChange={(e) => handleChange('polygon', 'fillOpacity', parseFloat(e.target.value))} /></label>
            <label>Kenarlık Rengi: <input type="color" value={styles.polygon.strokeColor} onChange={(e) => handleChange('polygon', 'strokeColor', e.target.value)} /></label>
            <label>Kenarlık Kalınlığı: <input type="number" value={styles.polygon.strokeWidth} onChange={(e) => handleChange('polygon', 'strokeWidth', parseFloat(e.target.value))} /></label>
            <label>Kesikli Kenar: <input type="text" value={styles.polygon.strokeDash} onChange={(e) => handleChange('polygon', 'strokeDash', e.target.value)} /></label>
          </div>
        )}
      </div>

      <div className="modal-buttons">
        <button onClick={handleSave}>Kaydet</button>
        <button onClick={onClose}>İptal</button>
      </div>
    </ModalWindow>
  );
}

export default FeatureStyleEditorModal;
