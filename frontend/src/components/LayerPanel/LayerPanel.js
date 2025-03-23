import React, { useState, useEffect, useRef } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import 'font-awesome/css/font-awesome.css';

function LayerPanel({
  systemLayers = {},
  visibleLayers = {},
  setVisibleLayers = () => {},
  onZoom,
  onOpacityChange,
  onBringToFront,
  onChangeStyle,
  onRenameLayer,
  onRemoveLayer,
  userLayers = [],
  setUserLayers = () => {},
  onOpenStyleEditor
}) {
  const [expanded, setExpanded] = useState(['exampleGroup', 'systemLayers', 'userLayers']);
  const [checked, setChecked] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const prevUserLayerIds = useRef([]);

  useEffect(() => {
    const newIds = userLayers
      .map(layer => `user-${layer.id}`)
      .filter(id => !checked.includes(id) && !prevUserLayerIds.current.includes(id));
    if (newIds.length > 0) {
      setChecked(prev => [...prev, ...newIds]);
    }
    prevUserLayerIds.current = userLayers.map(l => `user-${l.id}`);
  }, [userLayers]);

  useEffect(() => {
    const systemChecked = Object.keys(systemLayers).filter(key => visibleLayers[key]);
    const userChecked = checked.filter(id => id.startsWith('user-'));
    const nextChecked = [...systemChecked, ...userChecked];
    const isSame = nextChecked.length === checked.length && nextChecked.every(id => checked.includes(id));
    if (!isSame) {
      setChecked(nextChecked);
    }
  }, [visibleLayers, systemLayers]);

  const handleCheck = (checkedNodes) => {
    setChecked(checkedNodes);
    const newVisible = {};
    Object.keys(systemLayers).forEach(key => {
      newVisible[key] = checkedNodes.includes(key);
    });
    setVisibleLayers(newVisible);

    userLayers.forEach(layerObj => {
      const value = `user-${layerObj.id}`;
      layerObj.layer.setVisible(checkedNodes.includes(value));
    });
  };

  const handleRightClick = (e, layerKey) => {
    e.preventDefault();
    setContextMenu({ layerKey, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const renderLabel = (key, name) => (
    <span onContextMenu={(e) => handleRightClick(e, key)}>
      {name}
      <button onClick={() => onZoom(key)} style={{ marginLeft: '5px' }}>🔍</button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        defaultValue="1"
        onChange={(e) => onOpacityChange(key, parseFloat(e.target.value))}
        style={{ marginLeft: '8px', width: '70px' }}
        title="Opaklık Ayarı"
      />
    </span>
  );

  const systemLayerNodes = Object.entries(systemLayers).map(([key, layerObj]) => ({
    value: key,
    label: renderLabel(key, key.charAt(0).toUpperCase() + key.slice(1))
  }));

  const userLayerNodes = userLayers.length > 0 ? userLayers.map((layerObj) => ({
    value: `user-${layerObj.id}`,
    label: renderLabel(`user-${layerObj.id}`, layerObj.filename)
  })) : [{
    value: 'noData',
    label: <span style={{ fontStyle: 'italic', color: '#888' }}>(Henüz veri yok)</span>,
    disabled: true,
  }];

  const nodes = [
    {
      value: 'exampleGroup',
      label: '📂 Örnek Katmanlar',
      children: [
        {
          value: 'systemLayers',
          label: '📁 Sistem Katmanları',
          children: systemLayerNodes
        }
      ]
    },
    {
      value: 'userLayers',
      label: '📂 Kullanıcı Tabakaları',
      children: userLayerNodes
    }
  ];

  return (
    <>
      <button
        onClick={() => setMinimized(!minimized)}
        style={{
          position: 'absolute',
          top: '10px',
          left: minimized ? '10px' : '330px',
          zIndex: 1001,
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '6px 10px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        title={minimized ? 'Genişlet' : 'Minimize Et'}
      >
        {minimized ? '▶' : '◀'}
      </button>

      {!minimized && (
        <div
          className="layer-panel-container"
          style={{
            position: 'absolute',
            top: '50px',
            left: '10px',
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            zIndex: 1000,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '310px',
            fontSize: '14px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={closeContextMenu}
        >
          <CheckboxTree
            nodes={nodes}
            checked={checked}
            expanded={expanded}
            onCheck={handleCheck}
            onExpand={setExpanded}
            icons={{
              check: <span className="fa fa-check-square" />,
              uncheck: <span className="fa fa-square-o" />,
              halfCheck: <span className="fa fa-check-square-o" />,
              expandClose: <span className="fa fa-chevron-right" />,
              expandOpen: <span className="fa fa-chevron-down" />,
              parentClose: <span className="fa fa-folder" />,
              parentOpen: <span className="fa fa-folder-open" />,
              leaf: <span className="fa fa-file" />
            }}
          />
        </div>
      )}

      {contextMenu && (
        <ul
          style={{
            position: 'absolute',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px 0',
            listStyle: 'none',
            margin: 0,
            zIndex: 2000,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '160px'
          }}
          onMouseLeave={closeContextMenu}
        >
          <li onClick={() => { onBringToFront(contextMenu.layerKey); closeContextMenu(); }} style={menuStyle}>📤 Öne Getir</li>
          <li onClick={() => { onOpacityChange(contextMenu.layerKey, 1); closeContextMenu(); }} style={menuStyle}>💧 Opaklığı Sıfırla</li>
          <li onClick={() => { onOpenStyleEditor(contextMenu.layerKey); closeContextMenu(); }} style={menuStyle}>🎨 Stil Değiştir</li>

          <li
            onClick={() => {
              const newName = prompt("Yeni katman adı:");
              if (!newName || newName.trim() === '') return;
              if (newName) onRenameLayer(contextMenu.layerKey, newName);
              closeContextMenu();
            }}
            style={menuStyle}
          >
            📝 İsim Değiştir
          </li>

          <li onClick={() => { onRemoveLayer(contextMenu.layerKey); closeContextMenu(); }} style={{ ...menuStyle, color: 'red' }}>🗑️ Katmanı Kaldır</li>
        </ul>
      )}
    </>
  );
}

const menuStyle = {
  padding: '6px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

export default LayerPanel;
