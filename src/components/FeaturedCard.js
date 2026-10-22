import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useLang } from '../context/LanguageContext';

export const FeaturedCard = ({
  recipe,
  onPress
}) => {
  const { t } = useLang();
  if (!recipe) return null;

  // Pembersihan nilai kalori dari teks 'kcal' sedia ada
  const cleanCalories = String(recipe.calories || '')
    .replace(/kcal/gi, '')
    .trim();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground 
        source={{ uri: recipe.image || recipe.imageUrl }} 
        style={styles.imageBg} 
        imageStyle={{ borderRadius: SIZES.radius }}
      >
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t("chef_pick")}</Text>
          </View>

          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{t("str_rhwgo")}{recipe.prepTime}</Text>
            <Text style={styles.dot}>{t("str_844h0")}</Text>
            <Text style={styles.infoText}>
              {t("str_djdxy")}{cleanCalories} {t("kcal")}
            </Text>
            <Text style={styles.dot}>{t("str_844h0")}</Text>
            <Text style={styles.infoText}>{t("str_814qw")}{recipe.protein}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 190,
    width: '100%',
    marginBottom: 20,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium
  },
  imageBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end'
  },
  overlay: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 6
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    color: '#F3F4F6',
    fontSize: 12,
    fontWeight: '500'
  },
  dot: {
    color: '#F3F4F6',
    marginHorizontal: 6
  }
});