import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useLang } from '../context/LanguageContext';
import { AppContext } from '../context/AppContext';

export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { t } = useLang();
  const { theme, isDarkMode } = useContext(AppContext);

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.floatingBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'home-outline';
          let label = t('tab_home');

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
            label = t('tab_home');
          } else if (route.name === 'Smart') {
            iconName = isFocused ? 'restaurant' : 'restaurant-outline';
            label = t('tab_smart');
          } else if (route.name === 'Liked') {
            iconName = isFocused ? 'heart' : 'heart-outline';
            label = t('tab_liked');
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
            label = t('tab_profile');
          }

          let activeColor = COLORS.primary;
          if (route.name === 'Liked') {
            activeColor = '#EF4444';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemFocused,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && [
                    styles.activeIconContainer,
                    { 
                      backgroundColor: activeColor,
                      borderColor: theme.card
                    },
                  ],
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={isFocused ? 24 : 22}
                  color={isFocused ? '#FFFFFF' : (isDarkMode ? '#8E8E93' : '#9CA3AF')}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  { color: isDarkMode ? '#8E8E93' : '#9CA3AF' },
                  isFocused && [styles.activeLabel, { color: activeColor }],
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    width: '90%',
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabItemFocused: {
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  iconContainer: {
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    position: 'absolute',
    top: -10,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    ...SHADOWS.medium,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: 'bold',
    fontSize: 11,
  },
});