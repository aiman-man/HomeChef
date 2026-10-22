import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-yF5w1IBzKdSKpB2YqCMNWWDgXsWPO1k",
  authDomain: "homechefapp-7e422.firebaseapp.com",
  projectId: "homechefapp-7e422",
  storageBucket: "homechefapp-7e422.firebasestorage.app",
  messagingSenderId: "85689575859",
  appId: "1:85689575859:web:73dfc25c5fb9f1899483c6"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth dengan AsyncStorage Persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);