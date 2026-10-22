import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLang } from '../context/LanguageContext';
import { AppContext } from '../context/AppContext';

const TYPES = [
  'All',
  'Fresh Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Dry & Canned',
  'Bakery & Grains',
  'Sauces & Spices'
];

export default function PantryTrackerScreen({ navigation }) {
  const { lang, t } = useLang();
  const { pantryItems, addPantryItem, removeMultiplePantryItems, theme, isDarkMode } = useContext(AppContext);

  const [selectedType, setSelectedType] = useState('All');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [chosenType, setChosenType] = useState('Fresh Produce');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasSelectedDate, setHasSelectedDate] = useState(false);

  const filteredItems = selectedType === 'All'
    ? pantryItems
    : pantryItems.filter(item => item.type === selectedType);

  const calculateDaysLeft = (expiryDateString) => {
    if (!expiryDateString) return { status: 'fresh', text: 'N/A' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(expiryDateString);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'critical', text: lang === 'ms' ? 'Tamat Tempoh' : 'Expired' };
    } else if (diffDays === 0) {
      return { status: 'critical', text: lang === 'ms' ? 'Hari Ini' : 'Today' };
    } else if (diffDays === 1) {
      return { status: 'expiring', text: '1 day' };
    } else if (diffDays <= 3) {
      return { status: 'expiring', text: `${diffDays} days` };
    } else {
      return { status: 'fresh', text: `${diffDays} days` };
    }
  };

  const handleToggleSelectMode = () => {
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedItemIds([]);
    } else {
      setIsSelectMode(true);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(prev => prev.filter(itemId => itemId !== id));
    } else {
      setSelectedItemIds(prev => [...prev, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedItemIds.length) return;

    const itemsToDelete = pantryItems.filter(item => selectedItemIds.includes(item.id));

    Alert.alert(
      lang === 'ms' ? "Padam Bahan" : "Delete Ingredients",
      lang === 'ms' 
        ? `Adakah anda pasti ingin memadam ${selectedItemIds.length} bahan yang dipilih?` 
        : `Are you sure you want to delete ${selectedItemIds.length} selected items?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: lang === 'ms' ? "Padam" : "Delete",
          style: 'destructive',
          onPress: async () => {
            await removeMultiplePantryItems(itemsToDelete);
            setSelectedItemIds([]);
            setIsSelectMode(false);
          }
        }
      ]
    );
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert(
        lang === 'ms' ? "Nama Diperlukan" : "Missing Name",
        lang === 'ms' ? "Sila masukkan nama bahan dapur." : "Please enter an item name."
      );
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQty.trim() || '1 unit',
      type: chosenType,
      expiredDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString()
    };

    await addPantryItem(newItem);

    setNewItemName('');
    setNewItemQty('');
    setChosenType('Fresh Produce');
    setShowTypeDropdown(false);
    setExpiryDate(new Date());
    setHasSelectedDate(false);
    setShowDatePicker(false);
    setIsAddModalVisible(false);
  };

  const renderStatusBadge = (expiryDateString) => {
    const { status, text } = calculateDaysLeft(expiryDateString);
    let color = '#88D49E';
    if (status === 'expiring') color = '#FF9500';
    if (status === 'critical') color = '#FF3B30';

    return (
      <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
      </View>
    );
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpiryDate(selectedDate);
      setHasSelectedDate(true);
    }
  };

  const formattedSelectedDate = expiryDate.toLocaleDateString(
    lang === 'ms' ? 'ms-MY' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t("pantry_tracker")}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.selectBtn, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EFEFF4' }, isSelectMode && styles.cancelBtnPill]}
            onPress={handleToggleSelectMode}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectBtnText, { color: theme.text }, isSelectMode && styles.cancelBtnText]}>
              {isSelectMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>

          {!isSelectMode && (
            <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={TYPES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => {
            const isActive = selectedType === item;
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isActive && styles.chipActive
                ]}
                onPress={() => setSelectedType(item)}
              >
                <Text style={[styles.chipText, { color: theme.text }, isActive && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={48} color={theme.subText} />
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {lang === 'ms' ? "Tiada bahan dalam storan dapur anda." : "No items found in your pantry."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedItemIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[
                styles.itemCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                isSelected && styles.itemCardSelected
              ]}
              onPress={() => {
                if (isSelectMode) {
                  handleSelectItem(item.id);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.itemLeft}>
                {isSelectMode && (
                  <View style={styles.radioContainer}>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={isSelected ? "#FF3B30" : theme.subText}
                    />
                  </View>
                )}

                <View style={styles.itemIconBox}>
                  <Ionicons
                    name={
                      item.type === 'Fresh Produce' ? 'leaf' :
                      item.type === 'Dairy & Eggs' ? 'water' :
                      item.type === 'Meat & Seafood' ? 'restaurant' : 'basket'
                    }
                    size={20}
                    color="#FF6B35"
                  />
                </View>
                <View>
                  <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.itemSub, { color: theme.subText }]}>{item.quantity} • {item.type}</Text>
                </View>
              </View>
              {renderStatusBadge(item.expiredDate)}
            </TouchableOpacity>
          );
        }}
      />

      {isSelectMode && (
        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              !selectedItemIds.length && styles.deleteButtonDisabled
            ]}
            disabled={!selectedItemIds.length}
            onPress={handleDeleteSelected}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>
              {lang === 'ms' 
                ? `Padam Bahan ${selectedItemIds.length ? `(${selectedItemIds.length})` : ''}` 
                : `Delete Selected ${selectedItemIds.length ? `(${selectedItemIds.length})` : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t("add_ingredient")}</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                placeholder={t("ingredient_name_e_g_cheddar_ch")}
                placeholderTextColor={theme.subText}
                value={newItemName}
                onChangeText={setNewItemName}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                placeholder={t("quantity_e_g_200g_or_2_pcs")}
                placeholderTextColor={theme.subText}
                value={newItemQty}
                onChangeText={setNewItemQty}
              />

              <TouchableOpacity
                style={[styles.dropdownTriggerBtn, { backgroundColor: theme.inputBg }]}
                onPress={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowDatePicker(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dateBtnLeft}>
                  <Ionicons name="pricetag-outline" size={18} color="#FF6B35" />
                  <Text style={[styles.dateBtnText, { color: theme.subText }]}>
                    {lang === 'ms' ? 'Jenis: ' : 'Type: '}
                    <Text style={{ fontWeight: '700', color: theme.text }}>{chosenType}</Text>
                  </Text>
                </View>
                <Ionicons
                  name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={theme.subText}
                />
              </TouchableOpacity>

              {showTypeDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  {TYPES.filter(t => t !== 'All').map((typeItem) => (
                    <TouchableOpacity
                      key={typeItem}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: theme.border },
                        chosenType === typeItem && styles.dropdownItemActive
                      ]}
                      onPress={() => {
                        setChosenType(typeItem);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.text },
                          chosenType === typeItem && styles.dropdownItemTextActive
                        ]}
                      >
                        {typeItem}
                      </Text>
                      {chosenType === typeItem && (
                        <Ionicons name="checkmark" size={16} color="#FF6B35" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.dateSelectorBtn, { backgroundColor: theme.inputBg }]}
                onPress={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowTypeDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dateBtnLeft}>
                  <Ionicons name="calendar-outline" size={18} color="#FF6B35" />
                  <Text style={[styles.dateBtnText, { color: theme.subText }]}>
                    {hasSelectedDate ? (
                      <>
                        {lang === 'ms' ? 'Tarikh Luput: ' : 'Expiry Date: '}
                        <Text style={{ fontWeight: '700', color: theme.text }}>{formattedSelectedDate}</Text>
                      </>
                    ) : (
                      <Text style={{ color: theme.subText }}>
                        {lang === 'ms' ? 'Pilih Tarikh Luput' : 'Select Expiry Date'}
                      </Text>
                    )}
                  </Text>
                </View>
                <Ionicons
                  name={showDatePicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={theme.subText}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <View style={[styles.pickerWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <DateTimePicker
                    value={expiryDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                    textColor={theme.text}
                    style={styles.datePickerStyle}
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn, { backgroundColor: theme.inputBg }]}
                  onPress={() => {
                    setShowDatePicker(false);
                    setShowTypeDropdown(false);
                    setIsAddModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalCancelText, { color: theme.subText }]}>{t("cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleAddItem}>
                  <Text style={styles.saveText}>{t("add_item")}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  selectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  cancelBtnPill: { backgroundColor: '#FF3B3015' },
  selectBtnText: { fontSize: 13, fontWeight: '600' },
  cancelBtnText: { color: '#FF3B30', fontWeight: '700' },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
  categoryContainer: { marginVertical: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1 },
  itemCardSelected: { borderColor: '#FF3B3050', backgroundColor: '#FF3B3005' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  radioContainer: { marginRight: 12 },
  itemIconBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FF6B3512', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, fontSize: 14, textAlign: 'center' },
  bottomBarContainer: { position: 'absolute', bottom: 24, left: 20, right: 20 },
  deleteButton: { flexDirection: 'row', backgroundColor: '#FF3B30', borderRadius: 20, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  deleteButtonDisabled: { backgroundColor: '#C7C7CC', elevation: 0 },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { borderRadius: 24, padding: 20, maxHeight: '85%', elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { borderRadius: 14, height: 48, paddingHorizontal: 16, fontSize: 14, marginBottom: 10 },
  dropdownTriggerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, height: 48, paddingHorizontal: 16, marginBottom: 10 },
  dropdownMenu: { borderRadius: 14, borderWidth: 1, marginBottom: 10, maxHeight: 160, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  dropdownItemActive: { backgroundColor: '#FF6B3508' },
  dropdownItemText: { fontSize: 13 },
  dropdownItemTextActive: { fontWeight: '700', color: '#FF6B35' },
  dateSelectorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, height: 48, paddingHorizontal: 16, marginBottom: 10 },
  dateBtnLeft: { flexDirection: 'row', alignItems: 'center' },
  dateBtnText: { fontSize: 14, marginLeft: 10 },
  pickerWrapper: { borderRadius: 16, marginBottom: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  datePickerStyle: { alignSelf: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalCancelBtn: { backgroundColor: '#F2F2F7' },
  saveBtn: { backgroundColor: '#FF6B35' },
  modalCancelText: { fontSize: 14, fontWeight: '600' },
  saveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' }
});