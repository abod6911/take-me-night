// TAKE ME NIGHT - 100% Artisanal Gourmet Pizza Menu Data
export const HERO_DISHES = [
  {
    id: 'take_me_night',
    index: '01',
    name: 'TAKE ME NIGHT',
    line1: 'TAKE ME',
    line2: 'NIGHT',
    scriptOverlay: 'midnight truffle & hot honey',
    tagline: 'Signature House Pizza',
    description: 'Black-charred 48h sourdough crust, creamy pugliese burrata, crispy artisanal pepperoni cups, black truffle glaze & neon-hot chili honey.',
    price: 68,
    currency: 'SAR',
    image: '/dishes/take_me_night.png',
    badge: 'SIGNATURE'
  },
  {
    id: 'smoked_brisket',
    index: '02',
    name: 'SMOKED BRISKET',
    line1: 'SMOKED',
    line2: 'BRISKET',
    scriptOverlay: 'low & slow hickory smoke',
    tagline: '14-Hour Smoked Brisket',
    description: '14-hour hickory-smoked prime beef brisket, aged white cheddar, caramelized bourbon onions, pickled jalapeños & smoky BBQ glaze.',
    price: 74,
    currency: 'SAR',
    image: '/dishes/smoked_brisket.png',
    badge: 'CHEF CHOICE'
  },
  {
    id: 'crazy_ranch',
    index: '03',
    name: 'CRAZY RANCH',
    line1: 'CRAZY',
    line2: 'RANCH',
    scriptOverlay: 'garlic herb & buttermilk',
    tagline: 'Loaded Chicken Ranch',
    description: 'Chargrilled marinated chicken breast, sun-dried tomatoes, crispy turkey bacon bits, roasted garlic mozzarella & signature house buttermilk ranch drizzle.',
    price: 62,
    currency: 'SAR',
    image: '/dishes/crazy_ranch.png',
    badge: 'POPULAR'
  },
  {
    id: 'double_pepperoni',
    index: '04',
    name: 'DOUBLE PEPPERONI',
    line1: 'DOUBLE',
    line2: 'PEPPERONI',
    scriptOverlay: 'crispy cups & oregano',
    tagline: 'Crispy Cup & Char',
    description: 'San Marzano crushed tomato base, aged fior di latte, double-layered crispy beef pepperoni cups, Parmigiano-Reggiano & wild Sicilian oregano.',
    price: 58,
    currency: 'SAR',
    image: '/dishes/double_pepperoni.png',
    badge: 'CLASSIC'
  },
  {
    id: 'truffle_burrata',
    index: '05',
    name: 'TRUFFLE BURRATA',
    line1: 'TRUFFLE',
    line2: 'BURRATA',
    scriptOverlay: 'white gold & wild fungi',
    tagline: 'Wild Mushroom & White Truffle',
    description: 'Roasted wild porcini and cremini mushrooms, white truffle cream base, cold-stracciatella burrata, thyme & toasted pine nuts.',
    price: 69,
    currency: 'SAR',
    image: '/dishes/truffle_burrata.png',
    badge: 'LUXURY'
  },
  {
    id: 'hot_honey_diablo',
    index: '06',
    name: 'HOT HONEY DIABLO',
    line1: 'HOT HONEY',
    line2: 'DIABLO',
    scriptOverlay: 'sweet heat & live fire',
    tagline: 'Spicy Salami & Jalapeño',
    description: 'Spicy calabrese beef salami, fresh jalapeño rings, crushed red chili flakes, smoked provolone & wildflower hot honey glaze.',
    price: 64,
    currency: 'SAR',
    image: '/dishes/hot_honey_diablo.png',
    badge: 'SPICY'
  }
];

export const MENU_DISHES = [...HERO_DISHES];

export const EXTRA_DIPS = [
  { id: 'ranch', name: 'House Ranch', price: 5, emoji: '🥣' },
  { id: 'hothoney', name: 'Hot Honey', price: 6, emoji: '🍯' },
  { id: 'truffle', name: 'Truffle Aioli', price: 7, emoji: '🍄' },
  { id: 'bbq', name: 'Smoky BBQ', price: 5, emoji: '🔥' }
];

export const CRUST_OPTIONS = [
  { id: 'sourdough', name: 'Classic 72h Sourdough', price: 0 },
  { id: 'cheese', name: 'Sesame Mozzarella Stuffed', price: 8 },
  { id: 'charcoal', name: 'Charcoal Black Dough', price: 6 }
];

export const SIZE_OPTIONS = [
  { id: 'regular', name: 'Regular 10"', price: 0 },
  { id: 'large', name: 'Large 13"', price: 14 },
  { id: 'monster', name: 'Monster 16"', price: 26 }
];
