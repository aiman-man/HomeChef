import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export function SearchBar({ value, onChangeText }) {
  const { lang } = useLang();
  const isMalay = lang === 'ms' || lang === 'MY' || lang === 'BM';

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.textSecondary || '#8E8E93'}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={
            isMalay
              ? 'Cari resipi, bahan-bahan...'
              : 'Search recipes, ingredients...'
          }
          placeholderTextColor="#A1A1A6"
          value={value}
          onChangeText={onChangeText}
        />
        {value ? (
          <Ionicons
            name="close-circle"
            size={18}
            color="#C7C7CC"
            onPress={() => onChangeText('')}
            style={{ paddingLeft: 6 }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 50,
    paddingHorizontal: 16,
    width: '100%', // Memanjangkan search bar sepenuhnya
    borderWidth: 1,
    borderColor: '#EFEFEF',
    ...SHADOWS.light,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary || '#1C1C1E',
    height: '100%',
  },
});