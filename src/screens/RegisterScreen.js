import React, { useState, useContext } from 'react';
import { useLang } from '../context/LanguageContext';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const { t } = useLang();
  const {
    lang,
    setIsGuest,
    setUser,
    theme,
  } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔍 Fungsi Menyemak Kekuatan Kata Laluan (Password Strength Calculator)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };

    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    // Kekuatan Lemah / Bad
    if (pass.length < 6 || !hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { 
        score: 1, 
        label: lang === 'EN' ? 'Weak' : 'Lemah (Bad)', 
        color: '#E53935' 
      };
    }

    // Kekuatan Sangat Kukuh / Great
    if (pass.length >= 8 && hasSpecialChar) {
      return { 
        score: 3, 
        label: lang === 'EN' ? 'Great' : 'Sangat Teguh (Great)', 
        color: '#4CAF50' 
      };
    }

    // Kekuatan Sederhana / Good
    return { 
      score: 2, 
      label: lang === 'EN' ? 'Good' : 'Baik (Good)', 
      color: '#FF9800' 
    };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async () => {
    // 1. Semak jika ada ruangan kosong
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(t("error"), lang === 'EN' ? 'Please fill in all fields.' : 'Sila isi semua ruangan.');
      return;
    }

    // 2. Semak jika Confirm Password belum diisi
    if (!confirmPassword) {
      Alert.alert(
        t("error"), 
        lang === 'EN' ? 'Please enter confirm password.' : 'Sila masukkan pengesahan kata laluan.'
      );
      return;
    }

    // 3. Semak jika Password & Confirm Password tidak sama
    if (password !== confirmPassword) {
      Alert.alert(
        t("error"), 
        lang === 'EN' ? 'Passwords do not match.' : 'Kata laluan dan pengesahan kata laluan tidak sepadan.'
      );
      return;
    }

    // 4. Semak jika Password terlalu lemah / Bad
    if (strength.score === 1) {
      Alert.alert(
        t("error"),
        lang === 'EN'
          ? 'Please enter a stronger password. It must contain at least 6 characters, including uppercase, lowercase, and numbers.'
          : 'Sila masukkan kata laluan yang lebih ketat (sekurang-kurangnya 6 aksara, mengandungi huruf besar, huruf kecil, dan nombor).'
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Pendaftaran Pengguna di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Simpan Rekod Profil Pengguna di Firestore Collection 'users'
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
        likedRecipes: [],
        pantry: []
      });

      // 3. Kemaskini State AppContext
      if (setIsGuest) setIsGuest(false);
      if (setUser) setUser({
        uid: user.uid,
        email: user.email,
        name: name.trim()
      });

      Alert.alert(t("success"), lang === 'EN' ? 'Account created successfully!' : 'Akaun berjaya didaftarkan!');
      navigation.navigate('MainTabs');
    } catch (error) {
      let errorMessage = lang === 'EN' ? 'Registration failed.' : 'Pendaftaran gagal.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = lang === 'EN' ? 'Email is already in use.' : 'E-mel ini telah digunakan oleh akaun lain.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = lang === 'EN' ? 'Invalid email format.' : 'Format e-mel tidak sah.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = lang === 'EN' ? 'Password is too weak.' : 'Kata laluan terlalu lemah.';
      }
      Alert.alert(t("error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerArea}>
          <Text style={[styles.title, { color: theme.text }]}>{lang === 'EN' ? 'Create Account' : 'Daftar Akaun'}</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {lang === 'EN' ? 'Join HomeChef community today' : 'Sertai komuniti HomeChef hari ini'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Input Nama */}
          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder={t("full_name")} 
              placeholderTextColor={theme.subText} 
              value={name} 
              onChangeText={setName} 
            />
          </View>

          {/* Input Email */}
          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.icon} />
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

          {/* Input Kata Laluan */}
          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, marginBottom: 6 }]}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.icon} />
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

          {/* Indikator Kekuatan Kata Laluan */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.strengthBar, 
                    { 
                      backgroundColor: strength.color, 
                      width: strength.score === 1 ? '33%' : strength.score === 2 ? '66%' : '100%' 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {/* Input Confirm Password */}
          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border, marginTop: 8 }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput 
              style={[styles.input, { color: theme.text }]} 
              placeholder={lang === 'EN' ? 'Confirm Password' : 'Sahkan Kata Laluan'} 
              placeholderTextColor={theme.subText} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry={!showConfirmPassword} 
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
              style={styles.eyeIconBtn}
            >
              <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.subText} />
            </TouchableOpacity>
          </View>

          {/* Butang Register */}
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.88} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerBtnText}>
                {lang === 'EN' ? 'Register Account' : 'Daftar Akaun'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 45,
    paddingBottom: 30
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.light
  },
  headerArea: {
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    ...SHADOWS.medium
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  eyeIconBtn: {
    padding: 4,
    marginLeft: 6
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3
  },
  strengthText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...SHADOWS.light
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  }
});