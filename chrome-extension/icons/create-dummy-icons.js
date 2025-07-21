// Dummy-Icon-Generator für Chrome Extension
// Führen Sie dieses Skript mit Node.js aus, um PNG-Dummy-Icons zu erstellen

const fs = require('fs');
const path = require('path');

// Einfache PNG-Header für verschiedene Größen (1x1 Pixel, transparent)
const createPNG = (size) => {
  // Minimaler PNG-Header für transparentes 1x1 Pixel
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG Signatur
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Breite: 1
    0x00, 0x00, 0x00, 0x01, // Höhe: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Komprimierte Daten
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  return pngData;
};

// Erstelle Icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const filename = `icon${size}.png`;
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, createPNG(size));
  console.log(`Dummy-Icon erstellt: ${filename}`);
});

console.log('Alle Dummy-Icons erstellt. Diese sind minimal und transparent.');
console.log('Für eine echte Extension sollten Sie richtige Icons verwenden.');