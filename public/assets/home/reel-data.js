// The four live showpieces, in reel order. Names and taglines come from designs.json at render time;
// the palette is what the page morphs into while that showpiece is on screen.
export const REEL = [
  {
    slug: 'osteria-lume', design: 'restaurant', brand: 'Osteria Lume', industry: 'Restaurant',
    highlights: ['A candle you carry across the table', 'Steam and firelight in real time', 'Pick a table, a night, a time'],
    palette: { bg: '#0E0A08', fg: '#F3E9D8', accent: '#E8A54B' },
  },
  {
    slug: 'juniper-vale', design: 'real-estate', brand: 'Juniper & Vale', industry: 'Real estate',
    highlights: ['A photo you can re-light from noon to night', 'A floor plan that rises into a house', 'Fly between neighborhoods in 3D'],
    palette: { bg: '#F4F1EC', fg: '#141414', accent: '#A9492A' },
  },
  {
    slug: 'basecamp', design: 'youth-ministry', brand: 'Basecamp Students', industry: 'Youth ministry',
    highlights: ['Letters on springs you can push around', 'Embers that drift with your cursor', 'A photo wall you can throw'],
    palette: { bg: '#111111', fg: '#F5F5F0', accent: '#C6F432' },
  },
  {
    slug: 'lanternway', design: 'modern-church', brand: 'Lanternway Church', industry: 'Church',
    highlights: ['Morning light that leans with your mouse', 'A lantern that walks your first Sunday', 'Prayers that rise as paper lanterns'],
    palette: { bg: '#1F3A33', fg: '#FAF7F0', accent: '#E3A72F' },
  },
];
