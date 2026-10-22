export const COLORS = {
  primary: '#FF6B35',       // Sunset Orange khas HomeChef
  secondary: '#88D49E',     // Mint Green
  accent: '#FFB800',        // Warm Amber/Gold
  background: '#F8F9FA',    // Light Soft Grey/White
  cardBg: '#FFFFFF',        // Pure White Card
  textPrimary: '#111827',   // Dark Charcoal
  textSecondary: '#6B7280', // Slate Grey
  border: '#E5E7EB',        // Light Border
  shadow: 'rgba(0, 0, 0, 0.06)',
  danger: '#EF4444',
  success: '#10B981',
  
  // Theme Palettes (Light & Dark)
  light: {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1C1C1E',
    subText: '#8E8E93',
    border: '#EFEFEF',
    inputBg: '#F2F2F7',
    tabBar: '#FFFFFF',
    chipBg: '#FFFFFF',
  },
  dark: {
    bg: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    subText: '#A1A1A6',
    border: '#2C2C2E',
    inputBg: '#2C2C2E',
    tabBar: '#1E1E1E',
    chipBg: '#2C2C2E',
  }
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 20,              // Smooth Rounded Corners ala iOS
  padding: 16,
  h1: 24,
  h2: 20,
  h3: 16,
  body: 14,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};