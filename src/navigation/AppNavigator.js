import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import  RecipeDetailScreen  from '../screens/RecipeDetailScreen';
import  ChatbotScreen  from '../screens/ChatbotScreen';
import  LoginScreen  from '../screens/LoginScreen';
import  RegisterScreen  from '../screens/RegisterScreen';
import  ForgotPasswordScreen  from '../screens/ForgotPasswordScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { CategoryViewScreen } from '../screens/CategoryViewScreen';
import DietaryPreferencesScreen from '../screens/DietaryPreferencesScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import AboutCreditsScreen from '../screens/AboutCreditsScreen';
import PantryTrackerScreen from '../screens/PantryTrackerScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="CategoryView" component={CategoryViewScreen} />
      <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="AboutCredits" component={AboutCreditsScreen} />
      <Stack.Screen name="PantryTracker" component={PantryTrackerScreen} />
    </Stack.Navigator>
  );
};