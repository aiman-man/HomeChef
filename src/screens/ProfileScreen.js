import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  Alert, 
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AppContext } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
  const { lang, t } = useLang();
  const { user, isGuest, setUser, setIsGuest, likedRecipes = [], pantryItems = [], theme } = useContext(AppContext);
  
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // PENGESAHAN GUEST KETAT
  const isGuestUser = isGuest || !user || !user.uid;
  const displayName = isGuestUser ? (lang === 'ms' ? 'Pelawat' : 'Guest') : (user?.name || user?.displayName || t('home_cook'));
  const displayEmail = isGuestUser ? '' : (user?.email || '');
  const profileImage = isGuestUser ? null : (user?.photoURL || null);

  const handleAvatarPress = () => {
    if (isGuestUser) {
      const alertTitle = lang === 'ms' ? "Log Masuk Diperlukan" : "Login Required";
      const alertMsg = lang === 'ms' 
        ? "Sila log masuk ke akaun anda terlebih dahulu untuk mengurus gambar profil." 
        : "Please login to your account first to manage your profile picture.";

      Alert.alert(alertTitle, alertMsg);
      return;
    }

    setModalVisible(true);
  };

  const pickImage = async () => {
    setModalVisible(false);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(t("izin_diperlukan"), t("sila_benarkan_akses_ke_galeri_"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      const imageUri = `data:image/jpeg;base64,${imageAsset.base64}`;

      try {
        setUploading(true);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { photoURL: imageUri });

        if (setUser) {
          setUser({ ...user, photoURL: imageUri });
        }

        Alert.alert(
          lang === 'ms' ? "Berjaya!" : "Success!", 
          lang === 'ms' ? "Gambar profil berjaya dikemaskini." : "Profile picture updated successfully."
        );
      } catch (error) {
        console.error("Error saving profile image:", error);
        Alert.alert("Error", lang === 'ms' ? "Gagal menyimpan gambar profil." : "Failed to save profile picture.");
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = () => {
    setModalVisible(false);

    Alert.alert(
      lang === 'ms' ? "Padam Gambar" : "Remove Photo",
      lang === 'ms' ? "Adakah anda pasti ingin memadam gambar profil ini?" : "Are you sure you want to remove your profile picture?",
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: lang === 'ms' ? "Padam" : "Delete",
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              const userRef = doc(db, 'users', user.uid);

              await updateDoc(userRef, { photoURL: deleteField() });

              if (setUser) {
                const updatedUser = { ...user };
                delete updatedUser.photoURL;
                setUser(updatedUser);
              }

              Alert.alert(
                lang === 'ms' ? "Berjaya!" : "Success!", 
                lang === 'ms' ? "Gambar profil telah dipadamkan." : "Profile picture removed successfully."
              );
            } catch (error) {
              console.error("Error removing profile image:", error);
              Alert.alert("Error", lang === 'ms' ? "Gagal memadam gambar profil." : "Failed to remove profile picture.");
            } finally {
              setUploading(false);
            }
          }
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

    Alert.alert(t("daftar_keluar"), t("adakah_anda_pasti_ingin_log_ke"), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('log_out'),
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
    ]);
  };

  const authButtonText = isGuestUser
    ? (lang === 'ms' ? 'Log Masuk Sekarang' : 'Login Now')
    : t('log_out');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Profil */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t("profil_saya")}</Text>
          <TouchableOpacity 
            style={[styles.settingsHeaderBtn, { backgroundColor: theme.card, borderColor: theme.border }]} 
            onPress={() => navigation.navigate('AppSettings')}
          >
            <Ionicons name="cog-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.profileHero}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} activeOpacity={0.8} disabled={uploading}>
            {uploading ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#FF6B35" />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#FF6B35" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
          {displayEmail ? <Text style={[styles.userEmail, { color: theme.subText }]}>{displayEmail}</Text> : null}
          
          <TouchableOpacity style={styles.editProfileBadge} onPress={handleAvatarPress} disabled={uploading}>
            <Text style={styles.editProfileText}>
              {profileImage 
                ? (lang === 'ms' ? 'Kemaskini Gambar' : 'Edit Photo') 
                : (lang === 'ms' ? 'Muat Naik Gambar' : 'Upload Photo')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        {!isGuestUser && (
          <View style={[styles.statsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Liked')}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{likedRecipes.length}</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>{t("disimpan")}</Text>
            </TouchableOpacity>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('PantryTracker')}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{pantryItems.length}</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>{t("bahan_dapur")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Group 1 */}
        {!isGuestUser && (
          <>
            <Text style={[styles.sectionHeader, { color: theme.subText }]}>{t("pengurusan_dapur_diet")}</Text>
            <View style={[styles.cardGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('PantryTracker')}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#FF6B3515' }]}>
                    <Ionicons name="basket-outline" size={20} color="#FF6B35" />
                  </View>
                  <Text style={[styles.rowLabel, { color: theme.text }]}>{t("pantry_tracker_storan")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.subText} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('DietaryPreferences')}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#88D49E25' }]}>
                    <Ionicons name="nutrition-outline" size={20} color="#88D49E" />
                  </View>
                  <Text style={[styles.rowLabel, { color: theme.text }]}>{t("dietary_preferences")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.subText} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('Liked')}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#FF2D5515' }]}>
                    <Ionicons name="heart-outline" size={20} color="#FF2D55" />
                  </View>
                  <Text style={[styles.rowLabel, { color: theme.text }]}>{t("resipi_kegemaran")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.subText} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Menu Group 2 */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>{t("tetapan_sokongan")}</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('AppSettings')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#007AFF15' }]}>
                <Ionicons name="settings-outline" size={20} color="#007AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{t("app_settings")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.subText} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('Chatbot')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#5856D615' }]}>
                <Ionicons name="hardware-chip-outline" size={20} color="#5856D6" />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{t("ai_assistant_faq")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.subText} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('AboutCredits')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#34C75915' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#34C759" />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{t("mengenai_homechef")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.subText} />
          </TouchableOpacity>
        </View>

        {/* Auth Action Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.card }, isGuestUser && styles.loginButton]}
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

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeaderIndicator} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {lang === 'ms' ? 'Pengurusan Gambar Profil' : 'Profile Picture Options'}
                </Text>

                <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color="#FF6B35" />
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>
                    {profileImage 
                      ? (lang === 'ms' ? 'Pilih Gambar Baharu' : 'Choose New Photo')
                      : (lang === 'ms' ? 'Pilih Dari Galeri' : 'Choose from Gallery')}
                  </Text>
                </TouchableOpacity>

                {profileImage ? (
                  <TouchableOpacity style={styles.modalOption} onPress={removeImage}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>
                      {lang === 'ms' ? 'Padam Gambar Profil' : 'Remove Profile Photo'}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity 
                  style={[styles.cancelModalBtn, { backgroundColor: theme.inputBg }]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelModalText, { color: theme.subText }]}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FF6B35'
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF6B3518',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B3550'
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2
  },
  editProfileBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FF6B3512'
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35'
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5
  },
  cardGroup: {
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
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
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%'
  },
  logoutButton: {
    flexDirection: 'row',
    borderRadius: 20,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B3030',
    marginTop: 8
  },
  loginButton: {
    borderColor: '#FF6B3530'
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    marginLeft: 8
  },
  loginText: {
    color: '#FF6B35'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    alignItems: 'center'
  },
  modalHeaderIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#9E9E9E40',
    borderRadius: 2,
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 18
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12
  },
  cancelModalBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  cancelModalText: {
    fontSize: 14,
    fontWeight: '600'
  }
});