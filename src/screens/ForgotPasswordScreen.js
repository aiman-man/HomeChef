import React, { useState, useContext } from 'react';
import { useLang } from '../context/LanguageContext';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function ForgotPasswordScreen({
  navigation
}) {
  const { t } = useLang();
  const { theme, isDarkMode } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

    const handleReset = async () => {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail) {
      Alert.alert(t("required_field"), t("please_enter_your_email_addres"));
      return;
    }
    setLoading(true);
    try {
      // 1. Check if the email exists in Firestore 'users' collection
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', formattedEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          Alert.alert(t("email_not_found"), t("please_enter_a_registered_emai"));
          setLoading(false);
          return;
        }
      } catch (lookupError) {
        // Jika Firestore rules menolak bacaan sebelum login, teruskan ke Firebase Auth
        if (lookupError?.code !== 'permission-denied') throw lookupError;
      }

      // 2. Send Password Reset Email if user exists
      await sendPasswordResetEmail(auth, formattedEmail);
      Alert.alert(t("email_sent"), `A password reset link has been sent to ${formattedEmail}. Please check your inbox or spam folder.`);
      navigation.goBack();
    } catch (error) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      Alert.alert(t("reset_failed"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.text }]}>{t("forgot_password")}</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>{t("enter_your_registered_email_ad")}</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.icon} />
            <TextInput style={[styles.input, { color: theme.text }]} placeholder={t("email_address")} placeholderTextColor={theme.subText} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.88} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.resetBtnText}>{t("send_reset_link")}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 45
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20
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
    marginBottom: 16
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  resetBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  }
});