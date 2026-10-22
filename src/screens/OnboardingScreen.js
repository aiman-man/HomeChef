import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useLang } from '../context/LanguageContext';

export const OnboardingScreen = ({ navigation }) => {
  const { t } = useLang();
  const [currentSlide, setCurrentSlide] = useState(0);

  const SLIDES = [
    {
      id: '1',
      title: t('smart_recipe_engine') || 'Smart Recipe Engine',
      desc: t('select_available_pantry_ingredients') || 'Select available pantry ingredients and let HomeChef recommend the perfect recipes for you!',
      icon: 'restaurant',
    },
    {
      id: '2',
      title: t('guest_browsing_multi_language') || 'Guest Browsing & Multi-Language',
      desc: t('explore_recipes_instantly') || 'Explore recipes instantly without registration. Seamlessly switch between English and Malay.',
      icon: 'language',
    },
    {
      id: '3',
      title: t('interactive_chef_video') || 'Interactive Chef Video',
      desc: t('watch_concise_video_tutorials') || 'Watch concise video tutorials, track detailed nutrition metrics, and cook like a professional!',
      icon: 'play-circle',
    },
  ];

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>{t('skip') || 'Skip'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={slide.icon} size={60} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentSlide && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.88}>
        <Text style={styles.nextBtnText}>
          {currentSlide === SLIDES.length - 1
            ? t('get_started') || 'Get Started'
            : t('next') || 'Next'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingRight: 15,
  },
  skipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFF2EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  dotsRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});