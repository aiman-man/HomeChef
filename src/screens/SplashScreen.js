import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useLang } from '../context/LanguageContext';

export const SplashScreen = ({ navigation }) => {
  const { t } = useLang();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80',
        }}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="restaurant" size={42} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>{t("homechef")}</Text>
            <View style={styles.taglineBadge}>
              <Text style={styles.taglineText}>{t("authentic_home_cooking")}</Text>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.projectText}>{t("dfd_40143_mobile_application_d")}</Text>
            <Text style={styles.institutionText}>{t("tvet_mara_lumut")}</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.78)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: SIZES.padding,
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  taglineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  taglineText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F3F4F6',
    letterSpacing: 1.5,
  },
  footerContainer: {
    alignItems: 'center',
  },
  projectText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  institutionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E5E7EB',
  },
});