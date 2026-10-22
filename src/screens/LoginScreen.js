import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AppContext } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLang();
  const {
    setIsGuest,
    setUser,
    theme,
    isDarkMode
  } = useContext(AppContext);

  const goToHomeScreen = () => {
    navigation.navigate('MainTabs');
  };

  const handleLogin = async () => {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail || !password) {
      Alert.alert(t("warning"), t("please_enter_your_email_and_pa"));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formattedEmail, password);
      if (setIsGuest) setIsGuest(false);
      goToHomeScreen();
    } catch (error) {
      let errorMessage = 'Failed to log in. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      Alert.alert(t("login_error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // PEMBERSIHAN DATA AKAUN LAMA APABILA MENEKAN EXPLORE AS GUEST
  const handleGuestLogin = () => {
    if (setUser) setUser(null);
    if (setIsGuest) setIsGuest(true);
    goToHomeScreen();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.bg }]} bounces={false} showsVerticalScrollIndicator={false}>
        <ImageBackground 
          source={{
            uri: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop'
          }} 
          style={styles.heroBackground} 
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <SafeAreaView style={styles.headerContent}>
              <View style={styles.badgeRow}>
                <Ionicons name="restaurant-outline" size={14} color="#FFFFFF" />
                <Text style={styles.badgeText}>{t("homechef")}</Text>
              </View>
              <Text style={styles.heroTitle}>{t("welcome_back")}</Text>
              <Text style={styles.heroSubtitle}>{t("discover_delicious_recipes_dai")}</Text>
            </SafeAreaView>
          </View>
        </ImageBackground>

        <View style={[styles.cardContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t("sign_in")}</Text>

          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder={t("email_address")} 
              placeholderTextColor={theme.subText} 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
          </View>

          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder={t("password")} 
              placeholderTextColor={theme.subText} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
              style={styles.eyeIconBtn}
            >
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>{t("forgot_password_1")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginBtnText}>{t("log_in")}</Text>}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={[styles.registerSubText, { color: theme.subText }]}>{t("don_t_have_an_account")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>{t("register")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.subText }]}>{t("or")}</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <TouchableOpacity 
            style={[styles.guestBtn, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF5F1', borderColor: isDarkMode ? '#3A3A3C' : '#FFE4D6' }]} 
            onPress={handleGuestLogin} 
            activeOpacity={0.8}
          >
            <Ionicons name="compass-outline" size={18} color="#FF6B35" style={styles.guestIcon} />
            <Text style={[styles.guestText, { color: theme.text }]}>{t("explore_as_guest")}</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={theme.subText} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroBackground: {
    width: '100%',
    height: 270
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 24
  },
  headerContent: {
    paddingTop: 10
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 4
  },
  cardContainer: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    borderWidth: 1,
    ...SHADOWS.medium
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  eyeIconBtn: {
    padding: 4,
    marginLeft: 6
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16
  },
  forgotText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600'
  },
  loginBtn: {
    backgroundColor: '#FF6B35',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  registerSubText: {
    fontSize: 12,
  },
  registerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 12
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 24,
    height: 46,
    paddingHorizontal: 16
  },
  guestIcon: {
    marginRight: 8
  },
  guestText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4
  }
});