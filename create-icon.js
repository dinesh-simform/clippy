const { nativeImage } = require('electron');

// Create a simple clipboard icon using SVG
function createTrayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#fff"/>
      <text x="16" y="21" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#4F8CFF" font-weight="bold" letter-spacing="2">CLIPSY</text>
    </svg>
  `;
  return nativeImage.createFromDataURL('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));
}

module.exports = { createTrayIcon };
