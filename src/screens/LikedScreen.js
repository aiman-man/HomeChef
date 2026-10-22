import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { MOCK_RECIPES } from '../constants/mockData';
import RecipeCard from '../components/RecipeCard';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const LikedScreen = ({ navigation }) => {
  const { likedRecipes, toggleLikeRecipe, lang, isGuest, user, theme, isDarkMode } = useContext(AppContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isGuest || !user) {
      setRecipes([]);
      return;
    }

    const fetchLikedRecipes = async () => {
      if (!likedRecipes || likedRecipes.length === 0) {
        setRecipes([]);
        return;
      }

      setLoading(true);
      try {
        const localMatches = MOCK_RECIPES.filter((r) => likedRecipes.includes(r.id));
        const missingIds = likedRecipes.filter(
          (id) => !localMatches.some((r) => r.id === id)
        );

        const fetchedDocs = await Promise.all(
          missingIds.map(async (id) => {
            const docRef = doc(db, 'recipes', id);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
          })
        );

        const firestoreMatches = fetchedDocs.filter((r) => r !== null);
        setRecipes([...localMatches, ...firestoreMatches]);
      } catch (error) {
        console.error('Error fetching liked recipes details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, [likedRecipes, isGuest, user]);

  const handleGoToLogin = () => {
    if (navigation.getParent()) {
      navigation.getParent().navigate('Login');
    } else {
      navigation.navigate('Login');
    }
  };

  // --- PAPARAN PENGGUNA TAMU (GUEST) ---
  if (isGuest || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Tajuk Utama */}
          <Text style={[styles.title, { color: theme.text }]}>
            {lang === 'EN' ? 'Saved Recipes ❤️' : 'Resipi Kegemaran ❤️'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {lang === 'EN' ? 'Your collection of loved dishes' : 'Koleksi resipi pilihan anda'}
          </Text>

          {/* Kad Maklumat Log Masuk Pengguna Tamu */}
          <View style={[styles.guestBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF0F0', borderColor: isDarkMode ? '#3A3A3C' : '#FFE0E0' }]}>
              <Ionicons name="lock-closed" size={32} color={COLORS.primary || '#FF6B6B'} />
            </View>

            <Text style={[styles.guestTitle, { color: theme.text }]}>
              {lang === 'EN' ? 'Please Sign In' : 'Sila Log Masuk'}
            </Text>
            <Text style={[styles.guestText, { color: theme.subText }]}>
              {lang === 'EN'
                ? 'Please sign in your account to view and save your favorite recipes.'
                : 'Sila log masuk akaun anda untuk melihat dan menyimpan resipi kegemaran.'}
            </Text>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleGoToLogin}
              activeOpacity={0.88}
            >
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>
                {lang === 'EN' ? 'Login / Sign In' : 'Log Masuk'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- PAPARAN PENGGUNA LOG MASUK ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>
          {lang === 'EN' ? 'Saved Recipes ❤️' : 'Resipi Kegemaran ❤️'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>
          {lang === 'EN' ? 'Your collection of loved dishes' : 'Koleksi resipi pilihan anda'}
        </Text>

        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : recipes.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {lang === 'EN' ? 'No saved recipes yet.' : 'Tiada resipi disimpan lagi.'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id ? `${recipe.id}-${index}` : index}
                recipe={recipe}
                isLiked={likedRecipes.includes(recipe.id)}
                onLikePress={() => toggleLikeRecipe(recipe.id)}
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
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 110,
  },
  guestContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  guestBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderRadius: SIZES.radius,
    borderWidth: 1,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    ...SHADOWS.light,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary || '#FF6B6B',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default LikedScreen;