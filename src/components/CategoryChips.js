import React, { useContext } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';

const CATEGORIES = [
  { id: 'all', nameEN: 'All', nameMY: 'Semua', icon: 'grid-outline' },
  { id: 'breakfast', nameEN: 'Breakfast', nameMY: 'Sarapan', icon: 'cafe-outline' },
  { id: 'lunch', nameEN: 'Lunch', nameMY: 'Makan Tengah Hari', icon: 'restaurant-outline' },
  { id: 'dinner', nameEN: 'Dinner', nameMY: 'Makan Malam', icon: 'fast-food-outline' },
  { id: 'dessert', nameEN: 'Dessert', nameMY: 'Pencuci Mulut', icon: 'ice-cream-outline' },
  { id: 'drinks', nameEN: 'Drinks', nameMY: 'Minuman', icon: 'wine-outline' },
];

export const CategoryChips = ({ selectedCategory, onSelectCategory }) => {
  const { lang, theme, isDarkMode } = useContext(AppContext);
  const isMalay = lang === 'MY' || lang === 'BM';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
        const categoryLabel = isMalay ? cat.nameMY : cat.nameEN;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              { backgroundColor: theme.card, borderColor: theme.border },
              isSelected && styles.chipActive
            ]}
            onPress={() => onSelectCategory(cat.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={cat.icon}
              size={15}
              color={isSelected ? '#FFFFFF' : theme.subText}
              style={styles.icon}
            />
            <Text style={[styles.chipText, { color: theme.subText }, isSelected && styles.chipTextActive]}>
              {categoryLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    ...SHADOWS?.light,
  },
  chipActive: {
    backgroundColor: COLORS.primary || '#FF6B35',
    borderColor: COLORS.primary || '#FF6B35',
  },
  icon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});