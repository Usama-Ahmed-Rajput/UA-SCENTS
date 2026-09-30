export interface GradientPreset {
  id: string
  name: string
  category: string
  css_value: string
}

export const DEFAULT_GRADIENTS: GradientPreset[] = [
  // --- 🌿 Earthy & Green (Official Lamaar Presets) ---
  {
    id: 'g1',
    name: 'Dune (Sage Green)',
    category: 'Earthy & Green',
    css_value: 'linear-gradient(135deg, #b8c4a8 0%, #a0b090 100%)'
  },
  {
    id: 'g2',
    name: 'Azur (Emerald Mint)',
    category: 'Earthy & Green',
    css_value: 'linear-gradient(135deg, #c0d4c8 0%, #a8c0b0 100%)'
  },
  {
    id: 'g3',
    name: 'Wild Eucalyptus',
    category: 'Earthy & Green',
    css_value: 'linear-gradient(135deg, #c4d8c8 0%, #aabfae 100%)'
  },
  {
    id: 'g4',
    name: 'Pistachio Moss',
    category: 'Earthy & Green',
    css_value: 'linear-gradient(135deg, #cbd6c0 0%, #b2c4a4 100%)'
  },
  {
    id: 'g5',
    name: 'Olive Leaf',
    category: 'Earthy & Green',
    css_value: 'linear-gradient(135deg, #cfd4b8 0%, #b4bc98 100%)'
  },

  // --- 🌾 Warm & Cream (Official Lamaar Presets) ---
  {
    id: 'g6',
    name: 'Royal Vanilla (Warm Cashmere)',
    category: 'Warm & Cream',
    css_value: 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)'
  },
  {
    id: 'g7',
    name: 'Moroccan Souk (Spiced Tan)',
    category: 'Warm & Cream',
    css_value: 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)'
  },
  {
    id: 'g8',
    name: 'Qahwa (Warm Cinnamon)',
    category: 'Warm & Cream',
    css_value: 'linear-gradient(135deg, #f5e6c8 0%, #edd8b0 100%)'
  },
  {
    id: 'g9',
    name: 'Ananas Royal (Golden Velvet)',
    category: 'Warm & Cream',
    css_value: 'linear-gradient(135deg, #e8d470 0%, #d4bc50 100%)'
  },
  {
    id: 'g10',
    name: 'Champagne Silk',
    category: 'Warm & Cream',
    css_value: 'linear-gradient(135deg, #f7eee0 0%, #e8dac6 100%)'
  },
  {
    id: 'g11',
    name: 'Spiced Honey',
    category: 'Warm & Cream',
    css_value: 'linear-gradient(135deg, #f0dcc0 0%, #e0c4a4 100%)'
  },

  // --- 🌊 Fresh & Ocean (Official Lamaar Presets) ---
  {
    id: 'g12',
    name: 'Amalfi Coast (Sky Blue)',
    category: 'Fresh & Ocean',
    css_value: 'linear-gradient(135deg, #eaf0f6 0%, #d8e4ee 100%)'
  },
  {
    id: 'g13',
    name: 'Disfruta (Ice Blue)',
    category: 'Fresh & Ocean',
    css_value: 'linear-gradient(135deg, #e0ecf4 0%, #c8dde8 100%)'
  },
  {
    id: 'g14',
    name: 'Coastal Mist',
    category: 'Fresh & Ocean',
    css_value: 'linear-gradient(135deg, #d8e6f0 0%, #b8d4e4 100%)'
  },
  {
    id: 'g15',
    name: 'Deep Aqua',
    category: 'Fresh & Ocean',
    css_value: 'linear-gradient(135deg, #cee4eb 0%, #accfd8 100%)'
  },
  {
    id: 'g16',
    name: 'Azure Horizon',
    category: 'Fresh & Ocean',
    css_value: 'linear-gradient(135deg, #dbe8f4 0%, #bad4e8 100%)'
  },

  // --- 🌸 Floral & Soft (Official Lamaar Presets) ---
  {
    id: 'g17',
    name: 'French Lavande (Soft Lavender)',
    category: 'Floral & Soft',
    css_value: 'linear-gradient(135deg, #e8e0f0 0%, #d8d0e8 100%)'
  },
  {
    id: 'g18',
    name: 'Rebel Moon (Blush Rose)',
    category: 'Floral & Soft',
    css_value: 'linear-gradient(135deg, #e0c0b8 0%, #d0a8a0 100%)'
  },
  {
    id: 'g19',
    name: 'Gold Rush (Peach Glow)',
    category: 'Floral & Soft',
    css_value: 'linear-gradient(135deg, #f5e0e0 0%, #ecc8cc 100%)'
  },
  {
    id: 'g20',
    name: 'Rose Petal Velvet',
    category: 'Floral & Soft',
    css_value: 'linear-gradient(135deg, #eed8d4 0%, #dbb8b2 100%)'
  },
  {
    id: 'g21',
    name: 'Lilac Breeze',
    category: 'Floral & Soft',
    css_value: 'linear-gradient(135deg, #e4d8ec 0%, #ccaed4 100%)'
  },
  {
    id: 'g22',
    name: 'Blush Apricot',
    category: 'Floral & Soft',
    css_value: 'linear-gradient(135deg, #f4e2d8 0%, #e2c6b4 100%)'
  },

  // --- 🪵 Earthy & Woody (Official Lamaar Presets) ---
  {
    id: 'g23',
    name: 'Oud Essence (Amber Wood)',
    category: 'Earthy & Woody',
    css_value: 'linear-gradient(135deg, #d4a07a 0%, #c08860 100%)'
  },
  {
    id: 'g24',
    name: 'Sandalwood Spice',
    category: 'Earthy & Woody',
    css_value: 'linear-gradient(135deg, #d8b08c 0%, #be926c 100%)'
  },
  {
    id: 'g25',
    name: 'Smoked Cedar',
    category: 'Earthy & Woody',
    css_value: 'linear-gradient(135deg, #c4a892 0%, #a88a72 100%)'
  }
]
