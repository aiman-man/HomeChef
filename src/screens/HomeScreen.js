import React, { useState, useEffect, useContext } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryChips } from '../components/CategoryChips';
import { FeaturedCard } from '../components/FeaturedCard';
import RecipeCard from '../components/RecipeCard';
import { COLORS, SIZES } from '../constants/theme';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppContext } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  // Ambil state terkini dari AppContext
  const { theme, user, isGuest, dietaryPreferences } = useContext(AppContext);
  const { t, lang } = useLang();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data resipi dari Firestore secara async
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        const list = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            image: data.image || data.imageUrl,
            imageUrl: data.imageUrl || data.image,
          };
        });
        setRecipes(list);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter & Pengiraan Skor Padanan Diet (Match Score Sorting)
  const filteredRecipes = recipes
    .map((recipe) => {
      let matchScore = 0;

      if (dietaryPreferences?.diets?.length > 0) {
        const recipeTags = [
          ...(Array.isArray(recipe.tags) ? recipe.tags : []),
          ...(Array.isArray(recipe.dietType) ? recipe.dietType : [])
        ].map((t) => String(t).toLowerCase());

        dietaryPreferences.diets.forEach((userDiet) => {
          if (recipeTags.includes(String(userDiet).toLowerCase())) {
            matchScore += 1;
          }
        });
      }

      return { ...recipe, matchScore };
    })
    .filter((recipe) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        recipe.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch = recipe.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // LOGIKA NAMA (KEDAP GUEST): Jika isGuest true ATAU user tiada/tiada uid, paksa jadi 'Guest' / t('guest')
  const isGuestMode = isGuest || !user || !user.uid;
  const userName = isGuestMode 
    ? (lang === 'ms' ? 'Pelawat' : 'Guest') 
    : (user?.name ? user.name.split(' ')[0] : t('home_cook'));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header asal anda tanpa sebarang perubahan */}
      <Header 
        userPhoto={isGuestMode ? null : (user?.photoURL || null)} 
        onProfilePress={() => navigation.navigate('Profile')} 
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Sapaan */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingSub}>
            {lang === 'ms'
              ? `Selamat Datang, ${userName}! 👋`
              : `Hello, ${userName}! 👋`}
          </Text>
          <Text style={[styles.titleMain, { color: theme.text }]}>
            {t('what_are_we')}{' '}
            <Text style={styles.titleItalic}>{t('cooking')}</Text>{' '}
            {t('today')}
          </Text>
        </View>

        {/* Carian & Penapis Kategori */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
        />

        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Loading Indicator */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary || '#FF6B35'}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* Featured Card (Dipaparkan hanya jika kategori 'all' & tiada kata carian) */}
            {selectedCategory === 'all' && !search && filteredRecipes.length > 0 && (
              <FeaturedCard
                recipe={filteredRecipes[0]}
                onPress={() =>
                  navigation.navigate('RecipeDetail', { recipe: filteredRecipes[0] })
                }
              />
            )}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedCategory === 'all'
                ? t('popular_recipes')
                : t('category_results')}
            </Text>

            {/* Senarai Kad Resipi / Empty State */}
            {filteredRecipes.length > 0 ? (
              <View style={styles.grid}>
                {filteredRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id ? `${recipe.id}-${index}` : index}
                    recipe={recipe}
                    matchScore={recipe.matchScore}
                    onPress={() => navigation.navigate('RecipeDetail', { recipe })}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={54} color={theme.subText} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  {lang === 'ms' ? 'Tiada Resipi Dijumpai' : 'No Recipes Found'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
                  {lang === 'ms' 
                    ? 'Cuba cari dengan kata kunci lain atau tukar kategori.' 
                    : 'Try searching with another keyword or change category.'}
                </Text>
                {(search !== '' || selectedCategory !== 'all') && (
                  <TouchableOpacity 
                    style={styles.resetBtn} 
                    onPress={() => {
                      setSearch('');
                      setSelectedCategory('all');
                    }}
                  >
                    <Text style={styles.resetBtnText}>
                      {lang === 'ms' ? 'Set Semula Carian' : 'Reset Search'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  greetingHeader: {
    marginTop: 8,
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary || '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 2,
    lineHeight: 34,
  },
  titleItalic: {
    fontStyle: 'italic',
    color: COLORS.primary || '#FF6B35',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: COLORS.primary || '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});