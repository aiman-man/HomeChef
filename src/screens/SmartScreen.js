import React, { useState, useEffect, useContext } from 'react';
import { useLang } from '../context/LanguageContext';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import RecipeCard from '../components/RecipeCard';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const SmartScreen = ({ navigation }) => {
  const { t } = useLang();
  const { lang, likedRecipes, toggleLikeRecipe, theme, isDarkMode } = useContext(AppContext);

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [realRecipes, setRealRecipes] = useState([]);
  const [topSixIngredients, setTopSixIngredients] = useState([]);
  const [showOthersInput, setShowOthersInput] = useState(false);
  const [customSearch, setCustomSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const extractKeyword = (rawText) => {
    if (typeof rawText !== 'string') return '';

    let clean = rawText.toLowerCase();

    clean = clean.replace(/\(.*?\)/g, '');
    clean = clean.replace(/[:\/\.\+\-\,\?\!\;\_\*\=\<\>]/g, '');
    clean = clean.replace(/\b\d+(\.\d+)?\b/g, '');

    const wordsToRemove = [
      'large', 'medium', 'small', 'extra large', 'xl',
      'cup', 'cups', 'g', 'gram', 'grams', 'kg', 'ml', 'tbsp', 'tsp', 'tablespoon',
      'teaspoon', 'oz', 'pound', 'lb', 'cubed', 'diced', 'chopped', 'sliced', 'minced',
      'melted', 'fresh', 'raw', 'cooked', 'warm', 'cold', 'softened', 'potong', 'cincang'
    ];

    const regex = new RegExp(`\\b(${wordsToRemove.join('|')})\\b`, 'gi');
    clean = clean.replace(regex, '');

    const uniqueWords = [...new Set(clean.trim().split(/\s+/))];
    clean = uniqueWords.join(' ');

    if (!clean) return '';

    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const getCleanRoot = (text) => {
    if (typeof text !== 'string') return '';
    let clean = text.toLowerCase().trim();

    if (clean.endsWith('es') && clean.length > 3) {
      clean = clean.slice(0, -2);
    } else if (clean.endsWith('s') && clean.length > 3) {
      clean = clean.slice(0, -1);
    }
    return clean;
  };

  useEffect(() => {
    const recipesRef = collection(db, 'recipes');
    const unsubscribe = onSnapshot(
      recipesRef,
      (snapshot) => {
        const recipeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRealRecipes(recipeList);

        const ingredientCounts = {};
        recipeList.forEach((recipe) => {
          if (Array.isArray(recipe.ingredients)) {
            recipe.ingredients.forEach((ing) => {
              const keyword = extractKeyword(ing);
              if (keyword && keyword.length > 1) {
                ingredientCounts[keyword] = (ingredientCounts[keyword] || 0) + 1;
              }
            });
          }
        });

        const sortedIngredients = Object.keys(ingredientCounts).sort(
          (a, b) => ingredientCounts[b] - ingredientCounts[a]
        );

        setTopSixIngredients(sortedIngredients.slice(0, 6));
        setLoading(false);
      },
      (error) => {
        console.error('Ralat mengambil data resipi dari Firestore:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleIngredient = (item) => {
    setSelectedIngredients((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const filteredRecipes = realRecipes.filter((recipe) => {
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return false;

    const matchesSelectedButtons =
      selectedIngredients.length === 0 ||
      selectedIngredients.every((selectedKeyword) => {
        const cleanKeyword = getCleanRoot(selectedKeyword);

        return recipe.ingredients.some((ing) => {
          if (typeof ing !== 'string') return false;
          const cleanIng = getCleanRoot(ing);
          return cleanIng.includes(cleanKeyword) || cleanKeyword.includes(cleanIng);
        });
      });

    const matchesCustomInput =
      customSearch.trim() === '' ||
      recipe.ingredients.some((ing) => {
        if (typeof ing !== 'string') return false;
        return ing.toLowerCase().includes(customSearch.trim().toLowerCase());
      });

    return matchesSelectedButtons && matchesCustomInput;
  });

  const isFiltering = selectedIngredients.length > 0 || customSearch.trim() !== '';
  const displayedRecipes = isFiltering ? filteredRecipes : filteredRecipes.slice(0, 4);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerArea}>
          <Text style={styles.badge}>{t('smart_recommendation')}</Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {lang === 'EN' ? 'What ingredients do you have?' : 'Apa bahan yang anda ada?'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {lang === 'EN'
              ? 'Tap your available pantry items below or search manually.'
              : 'Pilih bahan di dapur anda atau taip secara manual.'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.chipsContainer}>
            {topSixIngredients.map((ingredientKeyword, idx) => {
              const isSelected = selectedIngredients.includes(ingredientKeyword);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isSelected && styles.chipSelected
                  ]}
                  onPress={() => toggleIngredient(ingredientKeyword)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: theme.subText }, isSelected && styles.chipTextSelected]}>
                    {isSelected ? '✓ ' : '+ '} {ingredientKeyword}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: theme.card, borderColor: theme.border },
                showOthersInput && styles.chipSelected
              ]}
              onPress={() => {
                setShowOthersInput(!showOthersInput);
                if (showOthersInput) setCustomSearch('');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, { color: theme.subText }, showOthersInput && styles.chipTextSelected]}>
                {showOthersInput ? '✕ Others' : '+ Others'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showOthersInput && (
          <View style={styles.searchBoxContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder={
                lang === 'EN' ? 'Type ingredient (e.g. butter, cheese)...' : 'Taip bahan (cth: butter, keju)...'
              }
              placeholderTextColor={theme.subText}
              value={customSearch}
              onChangeText={setCustomSearch}
              autoCapitalize="none"
            />
          </View>
        )}

        <Text style={[styles.resultsTitle, { color: theme.text }]}>
          {lang === 'EN' ? 'Suggested Recipes' : 'Cadangan Resipi'} ({displayedRecipes.length})
        </Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : displayedRecipes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {lang === 'EN'
                ? 'No recipes match your selected ingredients.'
                : 'Tiada resipi yang sepadan dengan bahan pilihan anda.'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {displayedRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id ? `${recipe.id}-${index}` : index}
                recipe={recipe}
                isLiked={likedRecipes?.includes(recipe.id)}
                onLikePress={() => toggleLikeRecipe && toggleLikeRecipe(recipe.id)}
                onPress={() => navigation.navigate('RecipeDetail', { recipe })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 110,
  },
  headerArea: {
    marginBottom: 16,
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 10,
    ...SHADOWS.light,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchBoxContainer: {
    marginBottom: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 13,
    ...SHADOWS.light,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default SmartScreen;