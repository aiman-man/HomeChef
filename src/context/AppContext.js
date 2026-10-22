import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc, onSnapshot, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { auth, db } from '../config/firebase';
import { useLang } from './LanguageContext';

export const AppContext = createContext();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const AppProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { lang: appLang, setLang: setAppLang } = useLang();
  const lang = appLang === 'ms' ? 'MY' : 'EN';

  const setLang = (value) => {
    const v = String(value).toLowerCase();
    setAppLang(v === 'my' || v === 'ms' || v === 'bm' ? 'ms' : 'en');
  };

  const [isGuest, setIsGuest] = useState(true);
  const [user, setUser] = useState(null);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);

  // State Preferensi Diet (Dietary Preferences)
  const [dietaryPreferences, setDietaryPreferences] = useState({
    diets: [],
    calorieGoal: null,
  });

  // Persistent Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);

  // Load Saved Dark Mode Preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@homechef_dark_mode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'true');
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.error('Error loading theme preference:', e);
      }
    };
    loadThemePreference();
  }, [systemColorScheme]);

  // Toggle Dark Mode and Save to AsyncStorage
  const toggleDarkMode = async () => {
    try {
      const nextState = !isDarkMode;
      setIsDarkMode(nextState);
      await AsyncStorage.setItem('@homechef_dark_mode', String(nextState));
    } catch (e) {
      console.error('Error saving theme preference:', e);
    }
  };

  // Schedule Pantry Expiry notifications
  const schedulePantryExpiryNotifications = async (pantryList) => {
    if (!pushNotificationsEnabled || !Array.isArray(pantryList)) return;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const scheduledNotifs = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduledNotifs) {
        if (notif.content?.data?.type === 'pantry_expiry') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      const now = new Date();

      for (const item of pantryList) {
        if (!item.expiredDate) continue;

        const expDate = new Date(item.expiredDate);
        
        const notifyDate = new Date(expDate);
        notifyDate.setDate(notifyDate.getDate() - 1);
        notifyDate.setHours(9, 0, 0, 0);

        if (notifyDate.getTime() > now.getTime()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: lang === 'MY' ? "⚠️ Amaran Tarikh Luput!" : "⚠️ Pantry Expiry Alert!",
              body: lang === 'MY' 
                ? `Bahan dapur "${item.name}" anda akan tamat tempoh esok!` 
                : `Your pantry item "${item.name}" is expiring tomorrow!`,
              data: { itemId: item.id, type: 'pantry_expiry' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notifyDate,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  };

  // 1. Khas untuk Auto Sign Out HANYA SEKALI semasa app mula-mula dibuka (Mount sahaja)
  useEffect(() => {
    signOut(auth).catch((err) => console.log('Auto signout on app start:', err));
  }, []);

  // 2. Listener Firebase Auth & Firestore Sync
  useEffect(() => {
    let unsubscribePantry = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribePantry) {
        unsubscribePantry();
        unsubscribePantry = null;
      }
      if (firebaseUser) {
        setIsGuest(false);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribePantry = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            setUser((prevUser) => ({
              ...prevUser,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName || '',
              photoURL: userData.photoURL || firebaseUser.photoURL || null,
            }));

            if (Array.isArray(userData.likedRecipes)) {
              setLikedRecipes(userData.likedRecipes);
            }

            if (Array.isArray(userData.pantry)) {
              setPantryItems(userData.pantry);
              schedulePantryExpiryNotifications(userData.pantry);
            }

            if (userData.dietaryPreferences) {
              setDietaryPreferences(userData.dietaryPreferences);
            } else {
              setDietaryPreferences({ diets: [], calorieGoal: '2,000 kcal' });
            }
          } else {
            setUser(null);
            setIsGuest(true);
            setLikedRecipes([]);
            setPantryItems([]);
            setDietaryPreferences({ diets: [], calorieGoal: '2,000 kcal' });
            if (unsubscribePantry) unsubscribePantry();
            unsubscribePantry = null;

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || null,
            });
          }
        }, (err) => {
          console.error("Firestore snapshot error:", err);
        });

      } else {
        setUser(null);
        setIsGuest(true);
        setLikedRecipes([]);
        setPantryItems([]);
        setDietaryPreferences({ diets: [], calorieGoal: '2,000 kcal' });
        if (unsubscribePantry) unsubscribePantry();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePantry) unsubscribePantry();
    };
  }, [pushNotificationsEnabled]);

  const toggleLanguage = () => {
    setAppLang(appLang === 'en' ? 'ms' : 'en');
  };

  const toggleMetric = () => setIsMetric(prev => !prev);
  const togglePushNotifications = () => setPushNotificationsEnabled(prev => !prev);

  const saveDietaryPreferences = async (newPreferences) => {
    setDietaryPreferences(newPreferences);
    if (!isGuest && user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          dietaryPreferences: newPreferences,
        });
      } catch (error) {
        console.error('Error saving dietary preferences to Firestore:', error);
      }
    }
  };

  const resetDietaryPreferences = async () => {
    const defaultPref = { diets: [], calorieGoal: null };
    setDietaryPreferences(defaultPref);
    if (!isGuest && user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          dietaryPreferences: deleteField(),
        });
      } catch (error) {
        console.error('Error resetting dietary preferences:', error);
      }
    }
  };

  const theme = isDarkMode ? {
    bg: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    subText: '#A1A1A6',
    border: '#2C2C2E',
    inputBg: '#2C2C2E',
    isDark: true
  } : {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1C1C1E',
    subText: '#8E8E93',
    border: '#EFEFEF',
    inputBg: '#F2F2F7',
    isDark: false
  };

  const toggleLikeRecipe = async (id) => {
    if (isGuest || !user) {
      Alert.alert(
        lang === 'EN' ? 'Login Required' : 'Sila Log Masuk',
        lang === 'EN'
          ? 'Please sign in your account to save favorite recipes.'
          : 'Sila log masuk akaun anda untuk menyimpan resipi kegemaran.'
      );
      return;
    }

    const isCurrentlyLiked = likedRecipes.includes(id);

    setLikedRecipes((prev) =>
      isCurrentlyLiked ? prev.filter((item) => item !== id) : [...prev, id]
    );

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        likedRecipes: isCurrentlyLiked ? arrayRemove(id) : arrayUnion(id),
      });
    } catch (error) {
      console.error('Error updating liked recipes in Firestore:', error);
    }
  };

  const addPantryItem = async (newItem) => {
    if (isGuest || !user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        pantry: arrayUnion(newItem)
      });
    } catch (error) {
      console.error("Error adding item to pantry array:", error);
    }
  };

  const removeMultiplePantryItems = async (itemsToRemove) => {
    if (isGuest || !user || !itemsToRemove.length) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        pantry: arrayRemove(...itemsToRemove)
      });
    } catch (error) {
      console.error("Error removing multiple items from pantry array:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        isGuest,
        setIsGuest,
        user,
        setUser,
        likedRecipes,
        setLikedRecipes,
        toggleLikeRecipe,
        pantryItems,
        addPantryItem,
        removeMultiplePantryItems,
        isDarkMode,
        toggleDarkMode,
        isMetric,
        toggleMetric,
        pushNotificationsEnabled,
        togglePushNotifications,
        dietaryPreferences,
        saveDietaryPreferences,
        resetDietaryPreferences,
        theme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppProvider;