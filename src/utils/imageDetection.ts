// Simple image detection utility
// In a production app, you'd use Core ML or Vision framework
// For now, we'll use a simple heuristic-based approach

export const detectFoodItems = async (imageUri: string): Promise<string[]> => {
  // Placeholder for actual ML detection
  // In production, integrate with:
  // - Core ML model trained on food items
  // - Vision framework for object detection
  // - Or a cloud API like Google Cloud Vision
  
  // For now, return empty array - user can manually enter label
  return [];
};

export const suggestPrimaryLabel = (notes?: string): string | undefined => {
  if (!notes) return undefined;
  
  const lowerNotes = notes.toLowerCase();
  const commonFoods = [
    'eggs', 'egg', 'scrambled', 'omelet', 'omelette',
    'oatmeal', 'oats',
    'chia', 'chia seed', 'chia pudding',
    'pancakes', 'pancake', 'waffles', 'waffle',
    'toast', 'bagel',
    'cereal', 'granola',
    'yogurt', 'yoghurt',
    'smoothie', 'smoothies',
    'fruit', 'fruits',
    'bacon', 'sausage',
  ];
  
  for (const food of commonFoods) {
    if (lowerNotes.includes(food)) {
      return food.split(' ')[0]; // Return first word
    }
  }
  
  return undefined;
};

