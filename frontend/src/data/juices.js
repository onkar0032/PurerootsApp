// ============================================
// Pure Roots — Static Juice Data (Fallback)
// ============================================
// Used when the backend API is unavailable

const staticJuices = [
  // 🍊 CLASSIC
  {
    id: 1, name: 'Sunrise Orange',
    description: 'Pure, cold-pressed Valencia oranges — the perfect way to start your morning.',
    category: 'classic', basePrice: 69, ingredients: ['Valencia Orange'],
    calories: 110, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Ginger Shot","Turmeric","Honey","Chia Seeds"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 2, name: 'Ruby Grapefruit',
    description: 'Zesty and refreshing pink grapefruit, bursting with citrus vitality.',
    category: 'classic', basePrice: 79, ingredients: ['Pink Grapefruit'],
    calories: 96, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Mint","Honey","Lime","Chia Seeds"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 3, name: 'Golden Pineapple',
    description: 'Sweet, tropical sun-ripened pineapple that transports you to paradise.',
    category: 'classic', basePrice: 89, ingredients: ['Sun-Ripened Pineapple'],
    calories: 132, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Coconut Milk","Mint","Ginger","Chia Seeds"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 4, name: 'Simply Apple',
    description: 'A crisp, perfectly balanced blend of Fuji and Granny Smith apples.',
    category: 'classic', basePrice: 69, ingredients: ['Fuji Apple', 'Granny Smith Apple'],
    calories: 120, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Cinnamon","Ginger","Honey","Lemon"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },

  // 🥬 DETOX
  {
    id: 5, name: 'Earthly Roots',
    description: 'A grounding blend of beetroot, carrot, ginger, and lemon for deep cleansing.',
    category: 'detox', basePrice: 99, ingredients: ['Beetroot', 'Carrot', 'Ginger', 'Lemon'],
    calories: 115, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Turmeric","Wheatgrass","Spirulina","Honey"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 6, name: 'Green Machine',
    description: 'Spinach, kale, cucumber, green apple, and mint — a powerhouse of greens.',
    category: 'detox', basePrice: 109, ingredients: ['Spinach', 'Kale', 'Cucumber', 'Green Apple', 'Mint'],
    calories: 95, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Chia Seeds","Protein Powder","Flax Seeds","Spirulina"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 7, name: 'The Purifier',
    description: 'Celery, parsley, lemon, and a hint of Himalayan salt for total detox.',
    category: 'detox', basePrice: 89, ingredients: ['Celery', 'Parsley', 'Lemon', 'Himalayan Salt'],
    calories: 55, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Ginger Shot","Wheatgrass","Cucumber","Mint"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 8, name: 'Glow Up',
    description: 'Cucumber, aloe vera, and green grapes for radiant skin and hydration.',
    category: 'detox', basePrice: 99, ingredients: ['Cucumber', 'Aloe Vera', 'Green Grapes'],
    calories: 80, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Mint","Lemon","Coconut Water","Chia Seeds"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },

  // 💪 WELLNESS
  {
    id: 9, name: 'Immunity Shield',
    description: 'Orange, turmeric, ginger, and cayenne pepper — your daily defense boost.',
    category: 'wellness', basePrice: 119, ingredients: ['Orange', 'Turmeric', 'Ginger', 'Cayenne Pepper'],
    calories: 130, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Honey","Lemon","Echinacea","Black Pepper"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 10, name: 'Recovery Fuel',
    description: 'Watermelon, coconut water, and lime — the ultimate post-workout refresher.',
    category: 'wellness', basePrice: 109, ingredients: ['Watermelon', 'Coconut Water', 'Lime'],
    calories: 100, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Chia Seeds","Electrolytes","Mint","Honey"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 11, name: 'Brain Power',
    description: 'Blueberry, pomegranate, and walnuts to fuel focus and cognitive clarity.',
    category: 'wellness', basePrice: 139, ingredients: ['Blueberry', 'Pomegranate', 'Walnuts'],
    calories: 175, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Flax Seeds","Oat Milk","Honey","Acai"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 12, name: 'Vitality Shot',
    description: 'A concentrated, potent blend of wheatgrass and lemon for instant energy.',
    category: 'wellness', basePrice: 79, ingredients: ['Wheatgrass', 'Lemon'],
    calories: 35, isAvailable: true, isSeasonal: false,
    customizations: '{"add_ons":["Ginger","Cayenne","Spirulina","Honey"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },

  // 🌸 SEASONAL
  {
    id: 13, name: 'Summer Breeze',
    description: 'Mango, passion fruit, and lime — a tropical escape in every sip. (Summer)',
    category: 'seasonal', basePrice: 129, ingredients: ['Mango', 'Passion Fruit', 'Lime'],
    calories: 160, isAvailable: true, isSeasonal: true,
    customizations: '{"add_ons":["Coconut Milk","Chia Seeds","Mint","Turmeric"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 14, name: 'Harvest Spice',
    description: 'Apple, carrot, cinnamon, and nutmeg — autumn in a glass. (Autumn)',
    category: 'seasonal', basePrice: 119, ingredients: ['Apple', 'Carrot', 'Cinnamon', 'Nutmeg'],
    calories: 140, isAvailable: true, isSeasonal: true,
    customizations: '{"add_ons":["Ginger","Honey","Vanilla","Oat Milk"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 15, name: 'Winter Zest',
    description: 'Pomegranate, pear, and star anise — warming and aromatic. (Winter)',
    category: 'seasonal', basePrice: 139, ingredients: ['Pomegranate', 'Pear', 'Star Anise'],
    calories: 135, isAvailable: true, isSeasonal: true,
    customizations: '{"add_ons":["Cinnamon","Honey","Ginger","Clove"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
  {
    id: 16, name: 'Spring Bloom',
    description: 'Strawberry, dragon fruit, and rose water — floral, fresh, and vibrant. (Spring)',
    category: 'seasonal', basePrice: 149, ingredients: ['Strawberry', 'Dragon Fruit', 'Rose Water'],
    calories: 125, isAvailable: true, isSeasonal: true,
    customizations: '{"add_ons":["Chia Seeds","Lavender","Honey","Coconut Milk"],"sweetness":["None","Light","Regular"],"ice":["No Ice","Light","Regular","Extra"]}'
  },
];

export default staticJuices;
