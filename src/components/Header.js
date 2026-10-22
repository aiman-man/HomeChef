import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { COLORS } from '../constants/theme';

export default function Header({ userPhoto, onProfilePress }) {
  const { user, isGuest, theme } = useContext(AppContext);
  const { lang, setLang } = useLang();

  // Pengesahan Guest
  const isGuestUser = isGuest || !user;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Logo Brand */}
      <View style={styles.brandContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="restaurant" size={20} color="#FFFFFF" />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.brandTitle, { color: theme.text }]}>HomeChef</Text>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary || '#FF6B35'} style={{ marginLeft: 4 }} />
          </View>
          <Text style={[styles.brandSubtitle, { color: theme.subText }]}>Luxury Culinary Experience</Text>
        </View>
      </View>

      {/* Language Switcher & Profile Avatar */}
      <View style={styles.rightContainer}>
        {/* Switcher EN / MY */}
        <View style={[styles.langToggleContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.langBtn, (lang === 'en' || lang === 'EN') && styles.langBtnActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[(lang === 'en' || lang === 'EN') ? styles.langTextActive : styles.langText, { color: (lang === 'en' || lang === 'EN') ? '#FFFFFF' : theme.subText }]}>EN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, (lang === 'ms' || lang === 'MY' || lang === 'BM') && styles.langBtnActive]}
            onPress={() => setLang('ms')}
          >
            <Text style={[(lang === 'ms' || lang === 'MY' || lang === 'BM') ? styles.langTextActive : styles.langText, { color: (lang === 'ms' || lang === 'MY' || lang === 'BM') ? '#FFFFFF' : theme.subText }]}>MY</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Avatar Button */}
        <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress}>
          {!isGuestUser && userPhoto ? (
            <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#FFF0EC' }]}>
              <Ionicons name="person" size={18} color={COLORS.primary || '#FF6B35'} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary || '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 10,
    marginTop: -2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langToggleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    marginRight: 10,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langBtnActive: {
    backgroundColor: COLORS.primary || '#FF6B35',
  },
  langText: {
    fontSize: 11,
    fontWeight: '600',
  },
  langTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});