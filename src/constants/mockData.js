export const CATEGORIES = [
  { id: 'all', nameEn: 'All', nameMy: 'Semua' },
  { id: 'breakfast', nameEn: 'Breakfast', nameMy: 'Sarapan' },
  { id: 'lunch', nameEn: 'Lunch', nameMy: 'Makan Tengah Hari' },
  { id: 'dinner', nameEn: 'Dinner', nameMy: 'Makan Malam' },
  { id: 'dessert', nameEn: 'Desserts', nameMy: 'Pencuci Mulut' },
];

export const INGREDIENTS_LIST = [
  'Ayam', 'Daging', 'Sotong', 'Udang', 'Telur', 'Bawang Merah', 
  'Bawang Putih', 'Cili Kering', 'Santan', 'Mee Yellow', 'Beras', 
  'Roti', 'Kacang', 'Kentang', 'Tahu', 'Sawi'
];

export const MOCK_RECIPES = [
  {
    id: '1',
    title: 'Nasi Lemak Sambal Sotong',
    category: 'breakfast',
    calories: 540,
    protein: '23g',
    prepTime: '25 min',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Beras', 'Santan', 'Sotong', 'Cili Kering', 'Telur', 'Kacang'],
    instructions: [
      'Tanak beras bersama santan, daun pandan, dan sedikit garam.',
      'Tumis bahan kisar cili kering dan bawang sehingga garing.',
      'Masukkan sotong dan perasakan dengan gula serta garam.',
      'Hidangkan bersama telur rebus, ikan bilis, dan timun.'
    ],
    youtubeId: 'sample_video_1',
    description: 'Nasi lemak tradisional khas Malaysia dengan sambal sotong pedas gurih.',
  },
  {
    id: '2',
    title: 'Mee Goreng Mamak',
    category: 'lunch',
    calories: 480,
    protein: '17g',
    prepTime: '15 min',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Mee Yellow', 'Tahu', 'Telur', 'Sawi', 'Cili Kering'],
    instructions: [
      'Tumis bawang putih dan bahan kisar cili.',
      'Masukkan tahu, cucur, dan mee kuning.',
      'Tambah sos cili, kicap manis, dan pecahkan telur.',
      'Gaul rata hingga masak dan perah asam jawa/limau.'
    ],
    youtubeId: 'sample_video_2',
    description: 'Mee goreng khas restoran Mamak dengan rasa gurih manis yang seimbang.',
  },
  {
    id: '3',
    title: 'Ayam Masak Merah',
    category: 'dinner',
    calories: 420,
    protein: '31g',
    prepTime: '35 min',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Ayam', 'Cili Kering', 'Bawang Merah', 'Santan', 'Kentang'],
    instructions: [
      'Goreng ayam separa masak bersama kunyit dan garam.',
      'Tumis bahan kisar hingga pecah minyak.',
      'Masukkan sos tomato, santan, dan ayam goreng.',
      'Renehkan hingga kuah pekat dan terbit minyak.'
    ],
    youtubeId: 'sample_video_3',
    description: 'Ayam goreng bersalut kuah sambal tomato kaya rempah.',
  },
  {
    id: '4',
    title: 'Kuih Lapis Tradisional',
    category: 'dessert',
    calories: 210,
    protein: '4g',
    prepTime: '45 min',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Beras', 'Santan', 'Tepung Sagu'],
    instructions: [
      'Bancuh tepung beras, tepung sagu, santan, dan gula.',
      'Bahagikan adunan kepada dua warna.',
      'Kukus lapisan demi lapisan selama 5 minit setiap satu.',
      'Sejukkan sepenuhnya sebelum dipotong.'
    ],
    youtubeId: 'sample_video_4',
    description: 'Kuih tradisional kukus berlapis warna-warni bertekstur kenyal lembut.',
  },
];