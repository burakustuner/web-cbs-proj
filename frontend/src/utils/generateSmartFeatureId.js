// Koordinatlardan benzersiz, anlamlı bir ID üretir
export function generateSmartFeatureId(feature) {
    const geometry = feature.getGeometry();
    const coordinates = geometry.getCoordinates();
  
    // Sayıları düzleştirip bir string'e çevir (sadece rakamları al)
    const flatCoords = JSON.stringify(coordinates).replace(/\D/g, '');
  
    // Rakamların toplamını al
    const sum = flatCoords
      .split('')
      .reduce((acc, val) => acc + Number(val), 0);
  
      const randomPart = Math.floor(Math.random() * 100000); // 🎲 random ek
      const timestamp = Date.now();
    // Zaman damgasıyla benzersizleştir

    return `feature-${sum}-${timestamp}-${randomPart}`;
  }
