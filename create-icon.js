const { nativeImage } = require('electron');

// Create a simple clipboard icon using SVG
function createTrayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- Clipboard body -->
      <rect x="8" y="6" width="16" height="20" rx="2" fill="#667eea"/>
      <!-- Clipboard clip -->
      <rect x="12" y="4" width="8" height="4" rx="1" fill="#764ba2"/>
      <!-- Paper -->
      <rect x="10" y="10" width="12" height="14" rx="1" fill="white"/>
      <!-- Lines on paper -->
      <line x1="12" y1="14" x2="20" y2="14" stroke="#667eea" stroke-width="1"/>
      <line x1="12" y1="17" x2="20" y2="17" stroke="#667eea" stroke-width="1"/>
      <line x1="12" y1="20" x2="18" y2="20" stroke="#667eea" stroke-width="1"/>
    </svg>
  `;

  return nativeImage.createFromDataURL('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));
}

module.exports = { createTrayIcon };
