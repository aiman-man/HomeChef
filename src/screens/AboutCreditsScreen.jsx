import React, { useState, useContext } from 'react';
import { useLang } from '../context/LanguageContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function AboutCreditsScreen({ navigation }) {
  const { t } = useLang();
  const { theme, isDarkMode } = useContext(AppContext);

  // State untuk kawalan Pop-up Modal In-App
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'terms' atau 'privacy'

  const openInAppPolicy = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('about_homechef')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Hero Logo Badge */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Ionicons name="restaurant" size={42} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>{t('homechef')}</Text>
          <Text style={[styles.versionText, { color: theme.subText }]}>
            {t('version_1_4_0_build_2026_09')}
          </Text>
          <Text style={styles.tagline}>{t('smart_culinary_companion_kitch')}</Text>
        </View>

        {/* Mission Statement */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t('our_mission')}</Text>
          <Text style={[styles.cardBody, { color: theme.subText }]}>
            {t('homechef_combines_intelligent_')}
          </Text>
        </View>

        {/* Technology Stack & Credits */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          {t('credits_attributions')}
        </Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.creditRow}>
            <Ionicons name="logo-react" size={20} color="#007AFF" />
            <Text style={[styles.creditText, { color: theme.text }]}>
              {t('built_with_react_native_expo_e')}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.creditRow}>
            <Ionicons name="image-outline" size={20} color="#FF6B35" />
            <Text style={[styles.creditText, { color: theme.text }]}>
              {t('photography_by_unsplash_commun')}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.creditRow}>
            <Ionicons name="sparkles-outline" size={20} color="#88D49E" />
            <Text style={[styles.creditText, { color: theme.text }]}>
              {t('iconography_by_expo_ionicons')}
            </Text>
          </View>
        </View>

        {/* Actions & In-App Policy Modals */}
        <View style={styles.linkGroup}>
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openInAppPolicy('terms')}
          >
            <Text style={[styles.linkText, { color: theme.text }]}>{t('terms_of_service')}</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openInAppPolicy('privacy')}
          >
            <Text style={[styles.linkText, { color: theme.text }]}>{t('privacy_policy')}</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={theme.subText} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerCopy, { color: theme.subText }]}>
          {t('2026_homechef_inc_all_rights_r')}
        </Text>
      </ScrollView>

      {/* POP-UP MODAL UNTUK TERMS OF SERVICE & PRIVACY POLICY (IN-APP) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {modalType === 'terms' ? t('terms_of_service') : t('privacy_policy')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={theme.subText} />
              </TouchableOpacity>
            </View>

            {/* Modal Body Content */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {modalType === 'terms' ? (
                <>
                  <Text style={[styles.policyHeading, { color: theme.text }]}>1. Acceptance of Terms</Text>
                  <Text style={[styles.policyText, { color: theme.subText }]}>
                    By accessing and using the HomeChef application, you agree to comply with and be bound by these terms and conditions.
                  </Text>
                  <Text style={[styles.policyHeading, { color: theme.text }]}>2. User Account & Conduct</Text>
                  <Text style={[styles.policyText, { color: theme.subText }]}>
                    Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted under their account.
                  </Text>
                  <Text style={[styles.policyHeading, { color: theme.text }]}>3. Recipe Disclaimer</Text>
                  <Text style={[styles.policyText, { color: theme.subText }]}>
                    Nutritional estimations and ingredient suggestions provided by HomeChef are for general information purposes only.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.policyHeading, { color: theme.text }]}>1. Information Collection</Text>
                  <Text style={[styles.policyText, { color: theme.subText }]}>
                    HomeChef collects minimal data such as saved recipes, pantry items, and dietary preferences to personalize your culinary experience.
                  </Text>
                  <Text style={[styles.policyHeading, { color: theme.text }]}>2. Data Security</Text>
                  <Text style={[styles.policyText, { color: theme.subText }]}>
                    We utilize secure cloud authentication and database management through Google Firebase to keep your data safe.
                  </Text>
                  <Text style={[styles.policyHeading, { color: theme.text }]}>3. Third-Party Services</Text>
                  <Text style={[styles.policyText, { color: theme.subText }]}>
                    We do not sell, trade, or transfer your personal preferences or data to third-party marketing entities.
                  </Text>
                </>
              )}
            </ScrollView>

            {/* Modal Close Action Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  sectionHeader: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  creditText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  linkGroup: {
    width: '100%',
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerCopy: {
    fontSize: 12,
    marginVertical: 16,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    paddingVertical: 16,
  },
  policyHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  policyText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});