// utils/convertToGeoJSON.js

import * as toGeoJSON from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';

// Yardımcı: Dosya uzantısını al
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// GeoJSON dosyasını okuyup parse et
async function readGeoJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target.result);
        resolve(geojson);
      } catch (err) {
        reject(new Error('GeoJSON okunamadı: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file);
  });
}

// KML/KMZ dosyasını GeoJSON'a çevir
async function convertKMLtoGeoJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml = new DOMParser().parseFromString(e.target.result, 'text/xml');
        const geojson = toGeoJSON.kml(xml);
        resolve(geojson);
      } catch (err) {
        reject(new Error('KML dönüştürme hatası: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('KML dosyası okunamadı'));
    reader.readAsText(file);
  });
}

// Ana kontrol fonksiyonu
export async function convertToGeoJSON(file) {
  const extension = getFileExtension(file.name);

  switch (extension) {
    case 'geojson':
    case 'json':
      return await readGeoJSON(file);
    case 'kml':
      return await convertKMLtoGeoJSON(file);
    case 'kmz':
      throw new Error('KMZ desteği henüz eklenmedi.');
    case 'dxf':
    case 'shp':
      throw new Error(`'${extension}' formatı henüz desteklenmiyor.`);
    default:
      throw new Error('Desteklenmeyen dosya formatı: ' + extension);
  }
}
