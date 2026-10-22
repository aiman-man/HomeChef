import React from 'react';
import { useLang } from '../context/LanguageContext';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_RECIPES } from '../constants/mockData';
import  RecipeCard  from '../components/RecipeCard';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
export const CategoryViewScreen = ({
  route,
  navigation
}) => {
  const { t } = useLang();
  const {
    categoryId,
    categoryName
  } = route.params || {
    categoryId: 'breakfast',
    categoryName: 'Breakfast'
  };
  const recipes = MOCK_RECIPES.filter(r => r.category === categoryId);
  return <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>{recipes.length}{t("resipi_ditemui")}</Text>

        <View style={styles.grid}>
          {recipes.map((recipe, index) => <RecipeCard key={recipe.id ? `${recipe.id}-${index}` : index} recipe={recipe} onPress={() => navigation.navigate('RecipeDetail', {
          recipe
        })} />)}
        </View>
      </ScrollView>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.light
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 40
  },
  countText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
});