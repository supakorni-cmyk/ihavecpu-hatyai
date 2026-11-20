export interface AdSlot {
  id: string;
  code: string;
  title: string;
  zone: string;
  priceTHB: number;
  status: 'Available' | 'Booked';
  dimensions: string;
  description: string;
}

// Data adapted from iHAVECPU Chiang Mai spots.js
export const AD_SLOTS: AdSlot[] = [
  { id: 'EX1', code: 'EX1', title: 'Exterior Logo 1', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },
  { id: 'EX2', code: 'EX2', title: 'Exterior Logo 2', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },
  { id: 'EX3', code: 'EX3', title: 'Exterior Logo 3', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },
  { id: 'EX4', code: 'EX4', title: 'Exterior Logo 4', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' }, 
  { id: 'EX5', code: 'EX5', title: 'Exterior Logo 5', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },
  { id: 'EX6', code: 'EX6', title: 'Exterior Logo 6', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },
  { id: 'EX7', code: 'EX7', title: 'Exterior Logo 7', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },
  { id: 'EX8', code: 'EX8', title: 'Exterior Logo 8', zone: 'exteriorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium exterior logo placement.' },

  // --- Interior Lightbox Zone ---
  { id: 'IST1', code: 'IST1', title: 'Interior Lightbox 1', zone: 'interiorLightBox', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Premium interior lightbox placement.' },
  { id: 'IST2', code: 'IST2', title: 'Interior Lightbox 2', zone: 'interiorLightBox', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Standard interior lightbox placement.' },
  { id: 'IST3', code: 'IST3', title: 'Interior Lightbox 3', zone: 'interiorLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'Standard interior lightbox placement.' },
  { id: 'IST4', code: 'IST4', title: 'Interior Lightbox 4', zone: 'interiorLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'Standard interior lightbox placement.' },
  { id: 'IST5', code: 'IST5', title: 'Interior Lightbox 5', zone: 'interiorLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'Standard interior lightbox placement.' },
  { id: 'IST6', code: 'IST6', title: 'Interior Lightbox 6', zone: 'interiorLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'Standard interior lightbox placement.' },
  { id: 'IST7', code: 'IST7', title: 'Interior Lightbox 7', zone: 'interiorLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'Standard interior lightbox placement.' },

  // --- Table Lightbox Zone ---
  { id: 'TST-1', code: 'TST-1', title: 'Table Lightbox 1 - DIY', zone: 'tableLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'High-visibility table surface lightbox.' },
  { id: 'TST-2', code: 'TST-2', title: 'Table Lightbox 2 - Notebook', zone: 'tableLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'High-visibility table surface lightbox.' },
  { id: 'TST-3', code: 'TST-3', title: 'Table Lightbox 3 - Notebook', zone: 'tableLightBox', priceTHB: 40000, status: 'Available', dimensions: '3m x 1.5m', description: 'High-visibility table surface lightbox.' },

  // --- Interior Logo Zone ---
  { id: 'A1', code: 'A1', title: 'A1 - CASE', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Case display section.' },
  { id: 'A2', code: 'A2', title: 'A2 - CASE', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Case display section.' },
  { id: 'A3', code: 'A3', title: 'A3 - CASE', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Case display section.' },
  { id: 'A4', code: 'A4', title: 'A4 - CASE', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Case display section.' },
  { id: 'A5', code: 'A5', title: 'A5 - MONITOR', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Monitor display section.' },
  { id: 'A6', code: 'A6', title: 'A6 - MONITOR', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Monitor display section.' },
  { id: 'A7', code: 'A7', title: 'A7 - MONITOR', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Monitor display section.' },  
  { id: 'A8', code: 'A8', title: 'A8 - MONITOR', zone: 'interiorLogo', priceTHB: 30000, status: 'Available', dimensions: '3m x 1.5m', description: 'Monitor display section.' },  
  { id: 'A9', code: 'A9', title: 'A9 - CPU + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'CPU display section.' },
  { id: 'A10', code: 'A10', title: 'A10 - CPU + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'CPU display section.' },
  { id: 'A11', code: 'A11', title: 'A11 - GAMING GEAR + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Gaming gear display section.' },
  { id: 'A12', code: 'A12', title: 'A12 - GAMING GEAR + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Gaming gear display section.' },
  { id: 'A13', code: 'A13', title: 'A13 - GAMING GEAR + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Gaming gear display section.' },
  { id: 'A14', code: 'A14', title: 'A14 - GAMING GEAR + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Gaming gear display section.' },
  { id: 'A15', code: 'A15', title: 'A15 - GAMING GEAR + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Gaming gear display section.' },
  { id: 'A16', code: 'A16', title: 'A16 - GAMING GEAR + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'Gaming gear display section.' },
  { id: 'A17', code: 'A17', title: 'A17 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' },
  { id: 'A18', code: 'A18', title: 'A18 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' },
  { id: 'A19', code: 'A19', title: 'A19 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' },
  { id: 'A20', code: 'A20', title: 'A20 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' }, 
  { id: 'A21', code: 'A21', title: 'A21 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' },
  { id: 'A22', code: 'A22', title: 'A22 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' },
  { id: 'A23', code: 'A23', title: 'A23 - DIY + FRONT ARTWORK', zone: 'interiorLogo', priceTHB: 50000, status: 'Available', dimensions: '3m x 1.5m', description: 'DIY display section.' },
];

// Helper to format zone keys into readable tab names
export const getZoneDisplayName = (zoneKey: string) => {
  switch (zoneKey) {
    case 'exteriorLogo': return 'Exterior Logo';
    case 'interiorLightBox': return 'Interior Lightbox';
    case 'tableLightBox': return 'Table Lightbox';
    case 'interiorLogo': return 'Interior Logo';
    default: return zoneKey;
  }
};