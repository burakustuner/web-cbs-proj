import React, { useState } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import 'font-awesome/css/font-awesome.css';

function LayerPanel({ showCities, setShowCities, showRoads, setShowRoads, showRegions, setShowRegions }) {
    const [expanded, setExpanded] = useState([
      'exampleGroup',
      'systemLayers',
      'userLayers'
    ]);
  
    const checked = [];
    if (showCities) checked.push('cities');
    if (showRoads) checked.push('roads');
    if (showRegions) checked.push('regions');
  
    const nodes = [
      {
        value: 'exampleGroup',
        label: '📂 Örnek Katmanlar',
        children: [
          {
            value: 'systemLayers',
            label: '📁 Sistem Katmanları',
            children: [
              { value: 'cities', label: 'Şehirler' },
              { value: 'roads', label: 'Yollar' },
              { value: 'regions', label: 'Bölgeler' },
            ],
          },
        ],
      },
      {
        value: 'userLayers',
        label: '📂 Kullanıcı Tabakaları',
        children: [
          {
            value: 'noData',
            label: <span style={{ fontStyle: 'italic', color: '#888' }}>(Henüz veri yok)</span>,
            disabled: true,
          },
        ],
      },
    ];
  
    const handleCheck = (checkedNodes) => {
      setShowCities(checkedNodes.includes('cities'));
      setShowRoads(checkedNodes.includes('roads'));
      setShowRegions(checkedNodes.includes('regions'));
    };
  
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
        width: '260px',
        fontSize: '14px'
      }}>
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
    );
  }
  
  export default LayerPanel;