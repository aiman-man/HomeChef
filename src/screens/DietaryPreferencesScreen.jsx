import React, { useState, useContext, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

// Senarai pilihan diet (Membuang 'vegan' dan 'low_carb')
const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: 'nutrition-outline' },
  { id: 'keto', label: 'Keto', icon: 'flame-outline' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: 'ban-outline' },
  { id: 'dairy_free', label: 'Dairy-Free', icon: 'water-outline' },
  { id: 'nut_free', label: 'Nut-Free', icon: 'shield-checkmark-outline' },
  { id: 'halal', label: 'Halal', icon: 'checkmark-circle-outline' },
  { id: 'paleo', label: 'Paleo', icon: 'egg-outline' },
];

const CALORIE_GOALS = ['1,500 kcal', '2,000 kcal', '2,500 kcal', 'Custom'];

export default function DietaryPreferencesScreen({ navigation }) {
  const { lang, t } = useLang();
  const {
    theme,
    isDarkMode,
    dietaryPreferences,
    saveDietaryPreferences,
    resetDietaryPreferences,
  } = useContext(AppContext);

  const [selectedDiets, setSelectedDiets] = useState(
    dietaryPreferences?.diets || []
  );

  // Set null secara default supaya tiada pilihan ter-highlight hijau awal-awal
  const [selectedCalorie, setSelectedCalorie] = useState(
    dietaryPreferences?.calorieGoal ? dietaryPreferences.calorieGoal : null
  );
  const [customCalorie, setCustomCalorie] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (dietaryPreferences) {
      setSelectedDiets(dietaryPreferences.diets || []);

      if (dietaryPreferences.calorieGoal) {
        if (CALORIE_GOALS.includes(dietaryPreferences.calorieGoal)) {
          setSelectedCalorie(dietaryPreferences.calorieGoal);
          setShowCustomInput(dietaryPreferences.calorieGoal === 'Custom');
        } else {
          // Jika nilai adalah nombor custom tersimpan (cth: "1,800 kcal")
          setSelectedCalorie('Custom');
          setShowCustomInput(true);
          setCustomCalorie(
            dietaryPreferences.calorieGoal.replace(' kcal', '').trim()
          );
        }
      } else {
        setSelectedCalorie(null);
        setShowCustomInput(false);
      }
    }
  }, [dietaryPreferences]);

  const toggleDiet = (id) => {
    setSelectedDiets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Boleh unselect pilihan kalori jika tekan chip yang sama
  const handleSelectCalorie = (goal) => {
    if (selectedCalorie === goal) {
      setSelectedCalorie(null);
      setShowCustomInput(false);
    } else {
      setSelectedCalorie(goal);
      setShowCustomInput(goal === 'Custom');
    }
  };

  // Reset ke Normal (Padam data dalam Firestore & Hilangkan semua warna pilihan)
  const handleReset = () => {
    Alert.alert(
      lang === 'ms' ? 'Tetapkan Semula' : 'Reset Preferences',
      lang === 'ms'
        ? 'Adakah anda pasti ingin memadam semua profil diet?'
        : 'Are you sure you want to clear your dietary profile?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: lang === 'ms' ? 'Tetap Semula' : 'Reset',
          style: 'destructive',
          onPress: async () => {
            setSelectedDiets([]);
            setSelectedCalorie(null);
            setShowCustomInput(false);
            setCustomCalorie('');
            if (resetDietaryPreferences) {
              await resetDietaryPreferences();
            }
            Alert.alert(
              t('success'),
              lang === 'ms'
                ? 'Profil diet telah ditetapkan semula.'
                : 'Preferences reset to default.'
            );
          },
        },
      ]
    );
  };

  // Simpan/Guna Perubahan (Apply Changes)
  const handleApplyChanges = async () => {
    let finalCalorie = selectedCalorie;
    if (selectedCalorie === 'Custom') {
      finalCalorie = customCalorie.trim() ? `${customCalorie.trim()} kcal` : null;
    }

    const updatedPreferences = {
      diets: selectedDiets,
      calorieGoal: finalCalorie,
    };

    if (saveDietaryPreferences) {
      await saveDietaryPreferences(updatedPreferences);
    }

    Alert.alert(
      t('preferences_saved'),
      lang === 'ms'
        ? 'Perubahan profil diet anda telah disimpan!'
        : 'Your dietary changes have been applied!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header dengan Butang RESET */}
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('dietary_preferences')}
        </Text>

        <TouchableOpacity style={styles.resetHeaderButton} onPress={handleReset}>
          <Text style={styles.resetHeaderText}>{lang === 'ms' ? 'Reset' : 'Reset'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionSubtitle, { color: theme.subText }]}>
          {t('select_your_dietary_requiremen')}
        </Text>

        {/* Diets Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('dietary_restrictions')}
        </Text>
        <View style={styles.gridContainer}>
          {DIETARY_OPTIONS.map((item) => {
            const isSelected = selectedDiets.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dietCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isSelected && styles.dietCardActive,
                ]}
                onPress={() => toggleDiet(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isSelected ? '#FFFFFF' : '#FF6B35'}
                />
                <Text
                  style={[
                    styles.dietLabel,
                    { color: theme.text },
                    isSelected && styles.dietLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: theme.card }]}>
                    <Ionicons name="checkmark" size={12} color="#FF6B35" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Daily Target Intake */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('daily_target_intake')}
        </Text>
        <View style={styles.calorieContainer}>
          {CALORIE_GOALS.map((goal) => {
            const isSelected = selectedCalorie === goal;
            return (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.calorieChip,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isSelected && styles.calorieChipActive,
                ]}
                onPress={() => handleSelectCalorie(goal)}
              >
                <Text
                  style={[
                    styles.calorieText,
                    { color: theme.text },
                    isSelected && styles.calorieTextActive,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Custom Calorie */}
        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={[
                styles.customInput,
                { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
              ]}
              placeholder="e.g. 1,800"
              placeholderTextColor="#A1A1A6"
              keyboardType="numeric"
              value={customCalorie}
              onChangeText={setCustomCalorie}
            />
            <Text style={{ color: theme.text, marginLeft: 8, fontWeight: '600' }}>
              kcal
            </Text>
          </View>
        )}

        {/* Action Button: Apply Changes */}
        <TouchableOpacity style={styles.ctaButton} onPress={handleApplyChanges}>
          <Text style={styles.ctaButtonText}>
            {lang === 'ms' ? 'Apply Changes' : 'Apply Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  resetHeaderButton: {
    paddingHorizontal: 8,
  },
  resetHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  content: {
    padding: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dietCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
  },
  dietCardActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  dietLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  dietLabelActive: {
    color: '#FFFFFF',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  calorieChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  calorieChipActive: {
    backgroundColor: '#88D49E',
    borderColor: '#88D49E',
  },
  calorieText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calorieTextActive: {
    color: '#FFFFFF',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  customInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    width: 140,
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});