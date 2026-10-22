import React, { useContext } from 'react';
import { useLang } from '../context/LanguageContext';
import { AppContext } from '../context/AppContext';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function AppSettingsScreen({ navigation }) {
  const { lang, t } = useLang();
  const {
    isGuest,
    user,
    setUser,
    setIsGuest,
    isDarkMode,
    toggleDarkMode,
    isMetric,
    toggleMetric,
    pushNotificationsEnabled,
    togglePushNotifications
  } = useContext(AppContext);

  const isGuestUser = isGuest || !user;

  // Warna tema mengikut Dark / Light Mode
  const themeContainer = isDarkMode ? '#121212' : '#F8F9FA';
  const themeCard = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const themeText = isDarkMode ? '#FFFFFF' : '#1C1C1E';
  const themeBorder = isDarkMode ? '#2C2C2E' : '#EFEFEF';

  const handleClearCache = () => {
    Alert.alert(
      lang === 'ms' ? 'Bersihkan Cache' : 'Clear Cache',
      lang === 'ms' ? 'Adakah anda pasti ingin membersihkan cache imej?' : 'Are you sure you want to clear image cache?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: lang === 'ms' ? 'Bersihkan' : 'Clear',
          style: 'destructive',
          onPress: () => Alert.alert(
            lang === 'ms' ? 'Berjaya' : 'Success',
            lang === 'ms' ? 'Cache imej telah dibersihkan.' : 'Image cache cleared successfully.'
          )
        }
      ]
    );
  };

  const handleAuthAction = () => {
    if (isGuestUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    Alert.alert(
      lang === 'ms' ? 'Log Keluar' : 'Log Out',
      lang === 'ms' ? 'Adakah anda pasti ingin log keluar dari akaun anda?' : 'Are you sure you want to log out of your account?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: lang === 'ms' ? 'Log Keluar' : 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (e) {
              console.error('Sign out error:', e);
            }
            if (setUser) setUser(null);
            if (setIsGuest) setIsGuest(true);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const authButtonText = isGuestUser
    ? (lang === 'ms' ? 'Log Masuk Sekarang' : 'Login Now')
    : (lang === 'ms' ? 'Log Keluar Akaun' : 'Log Out of Account');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeContainer }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: themeCard }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={themeText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeText }]}>{t("app_settings")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section: Preferences */}
        <Text style={styles.sectionHeader}>{t("preferences")}</Text>
        <View style={[styles.cardGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          {/* Push Notifications */}
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FF6B3515' }]}>
                <Ionicons name="notifications-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.rowLabel, { color: themeText }]}>{t("push_notifications")}</Text>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={togglePushNotifications}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeBorder }]} />

          {/* Metric Units */}
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#007AFF15' }]}>
                <Ionicons name="scale-outline" size={20} color="#007AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: themeText }]}>{t("metric_measurement_units")}</Text>
            </View>
            <Switch
              value={isMetric}
              onValueChange={toggleMetric}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeBorder }]} />

          {/* Dark Appearance */}
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#5856D615' }]}>
                <Ionicons name="moon-outline" size={20} color="#5856D6" />
              </View>
              <Text style={[styles.rowLabel, { color: themeText }]}>{t("dark_appearance")}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#5856D6' }}
            />
          </View>
        </View>

        {/* Section: Storage & Account */}
        <Text style={styles.sectionHeader}>{t("storage_account")}</Text>
        <View style={[styles.cardGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          <TouchableOpacity style={styles.rowItem} onPress={handleClearCache}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FF950015' }]}>
                <Ionicons name="trash-outline" size={20} color="#FF9500" />
              </View>
              <Text style={[styles.rowLabel, { color: themeText }]}>{t("clear_image_cache")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeBorder }]} />

          <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('AboutCredits')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#34C75915' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#34C759" />
              </View>
              <Text style={[styles.rowLabel, { color: themeText }]}>{t("about_legal_information")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: themeCard, borderColor: isGuestUser ? '#FF6B3530' : '#FF3B3030' }]}
          onPress={handleAuthAction}
        >
          <Ionicons
            name={isGuestUser ? "log-in-outline" : "log-out-outline"}
            size={20}
            color={isGuestUser ? "#FF6B35" : "#FF3B30"}
          />
          <Text style={[styles.logoutText, isGuestUser && styles.loginText]}>
            {authButtonText}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  content: {
    padding: 20
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5
  },
  cardGroup: {
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    width: '100%'
  },
  logoutButton: {
    flexDirection: 'row',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 8
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    marginLeft: 8
  },
  loginText: {
    color: '#FF6B35'
  }
});