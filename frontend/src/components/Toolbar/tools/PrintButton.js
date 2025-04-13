import React, { useEffect, useRef } from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import PrintDialog from 'ol-ext/control/PrintDialog';
import 'ol-ext/control/PrintDialog.css';
import { saveAs } from 'file-saver';

function PrintButton({ map }) {
  const printDialogRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Check if control already exists and remove it
    if (printDialogRef.current) {
      try {
        map.removeControl(printDialogRef.current);
      } catch (e) {
          console.warn("Error removing previous PrintDialog:", e);
      }
      printDialogRef.current = null;
    }

    console.log("🗺️ PrintButton: Harita hazır, PrintDialog ekleniyor...");
    const printDialog = new PrintDialog({
      lang: 'en',
      saveAs: function(blob, filename) {
        console.log(`🛂 PrintDialog saveAs çağrıldı: ${filename}`);
        saveAs(blob, filename);
      },
      print: { // Default print settings
        paperSize: 'A4',
        scale: 1000,
        margin: 'none'
      }
    });

    try {
        map.addControl(printDialog);
        printDialogRef.current = printDialog;
        console.log("✅ PrintButton: PrintDialog eklendi varsayılanlarla.");
    } catch (e) {
        console.error("Error adding PrintDialog control:", e);
    }

    // Cleanup function
    return () => {
      if (map && printDialogRef.current) {
        console.log("➖ PrintButton: PrintDialog kaldırılıyor.");
        try {
            map.removeControl(printDialogRef.current);
        } catch (e) {
            console.warn("Error removing PrintDialog on cleanup:", e);
        }
        printDialogRef.current = null;
      }
    };
  }, [map]); // Dependency array includes map

  const openPrintDialog = () => {
    if (printDialogRef.current) {
      console.log("🖨️ PrintButton: PrintDialog açılıyor...");
      try {
        if (typeof printDialogRef.current.print === 'function') {
          printDialogRef.current.print();
        } else {
          console.error("❌ PrintButton: PrintDialog kontrolünde .print() metodu bulunamadı!");
        }
      } catch (error) {
        console.error("❌ PrintButton: PrintDialog .print() çağrılırken hata oluştu:", error);
      }
    } else {
      console.error("❌ PrintButton: PrintDialog kontrolü bulunamadı veya henüz eklenmedi!");
    }
  };

  return (
    <Toolbar.Button
      className="toolbar-button"
      onClick={openPrintDialog}
    >
      🖨️ Print
    </Toolbar.Button>
  );
}

export default PrintButton; 