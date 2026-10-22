import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function RecipeCard({ recipe, onPress }) {
  const { likedRecipes = [], toggleLikeRecipe, theme, isDarkMode } = useContext(AppContext);
  const { lang } = useLang();

  const isLiked = likedRecipes.includes(recipe?.id);
  const isMalay = lang === 'ms' || lang === 'MY' || lang === 'BM';

  const recipeImage = recipe?.image || recipe?.imageUrl;

  const getCategoryStyle = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'breakfast':
      case 'sarapan':
        return { bg: isDarkMode ? '#064E3B' : '#D1FAE5', text: isDarkMode ? '#6EE7B7' : '#065F46' };
      case 'lunch':
      case 'makan tengah hari':
        return { bg: isDarkMode ? '#7C2D12' : '#FFEDD5', text: isDarkMode ? '#FDBA74' : '#9A3412' };
      case 'dinner':
      case 'makan malam':
        return { bg: isDarkMode ? '#831843' : '#FCE7F3', text: isDarkMode ? '#F9A8D4' : '#9D174D' };
      case 'dessert':
      case 'pencuci mulut':
        return { bg: isDarkMode ? '#7F1D1D' : '#FEE2E2', text: isDarkMode ? '#FCA5A5' : '#991B1B' };
      case 'drinks':
      case 'minuman':
        return { bg: isDarkMode ? '#0C4A6E' : '#E0F2FE', text: isDarkMode ? '#7DD3FC' : '#0369A1' };
      default:
        return { bg: isDarkMode ? '#374151' : '#E5E7EB', text: isDarkMode ? '#D1D5DB' : '#374151' };
    }
  };

  const catStyle = getCategoryStyle(recipe?.category);

  const displayCalories = recipe?.calories?.toString().includes('kcal')
    ? recipe.calories
    : `${recipe?.calories || 0} kcal`;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} 
      onPress={onPress} 
      activeOpacity={0.88}
    >
      <View style={styles.imageContainer}>
        {recipeImage ? (
          <Image source={{ uri: recipeImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.inputBg }]}>
            <Text style={{ fontSize: 10, color: theme.subText }}>
              {isMalay ? 'Tiada Gambar' : 'No Image'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.heartButton, { backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)' }]}
          onPress={() => recipe?.id && toggleLikeRecipe(recipe.id)}
        >
          <Text style={styles.heartIcon}>{isLiked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {recipe?.category ? (
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {recipe?.title || (isMalay ? 'Resipi' : 'Recipe')}
        </Text>

        <View style={styles.nutritionRow}>
          <Text style={[styles.nutritionText, { color: theme.subText }]}>🔥 {displayCalories}</Text>
          {recipe?.prepTime && (
            <>
              <Text style={[styles.dot, { color: theme.subText }]}>•</Text>
              <Text style={[styles.nutritionText, { color: theme.subText }]}>⏱️ {recipe.prepTime}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: SIZES.radius || 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...SHADOWS.light,
  },
  imageContainer: {
    height: 115,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 15,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 12,
  },
  content: {
    padding: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    height: 36,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 11,
  },
  dot: {
    marginHorizontal: 4,
  },
});