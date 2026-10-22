import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLang } from '../context/LanguageContext';
import { AppContext } from '../context/AppContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ⚠️ Letak API Key dari Google AI Studio di sini
const GEMINI_API_KEY = 'AQ.Ab8RN6LNs74DxZiw8IEs2vgZE9zjFoHg2CoBmGFmMFqnouBw7g';

// Senarai model ikut turutan keutamaan. Kalau satu habis kuota / tiada / sibuk,
// app terus tukar ke model seterusnya. Tambah atau buang nama model di sini.
const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

// Kod error yang bermaksud "cuba model lain": 404 tiada, 429 kuota habis, 500/503 server sibuk
const RETRY_CODES = [404, 429, 500, 503];

// Ingat model terakhir yang berjaya supaya tak cuba model yang dah mati setiap kali
let lastGoodModel = null;

const SYSTEM_INSTRUCTION = `Anda ialah Pembantu Dapur HomeChef (HomeChef Assistant) yang pintar, mesra, dan serba tahu.
Fungsi utama anda:
1. Menjawab apa sahaja soalan berkaitan masakan, resipi, petua dapur, ganti bahan, dan simpanan makanan (Pantry Tracker).
2. Membantu pengguna navigasi app HomeChef (Dietary Preferences, Liked Recipes, Cooking Mode, App Settings).
3. Anda JUGA BOLEH menjawab soalan am lain secara pintar (seperti cuaca, sains, fakta harian, gaya hidup, dll).
4. Jika soalan diajukan dalam Bahasa Melayu, jawab dalam Bahasa Melayu secara semula jadi. Jika dalam Bahasa Inggeris, jawab dalam Bahasa Inggeris.
5. Berikan jawapan yang kemas, guna perenggan ringkas dan emoji yang bersesuaian.`;

export default function ChatbotScreen({ navigation }) {
  const { t, lang } = useLang();
  const { theme } = useContext(AppContext);

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text:
        lang === 'ms'
          ? 'Selamat datang ke Assistant HomeChef! 🍳\nSaya dikuasai oleh Google Gemini AI. Sila tanya apa sahaja soalan masakan atau soalan am!'
          : 'Welcome to HomeChef Assistant! 🍳\nPowered by Google Gemini AI. Ask me any culinary or general questions!',
      time: lang === 'ms' ? 'Baru sahaja' : 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Fetch Gemini API Response (tukar model automatik kalau satu gagal)
  const fetchGeminiResponse = async (userQuery) => {
    if (!GEMINI_API_KEY) {
      return lang === 'ms'
        ? '⚠️ **Gemini API Key Belum Ditetapkan.**\nSila letak API Key dalam ChatbotScreen.js.'
        : '⚠️ **Gemini API Key Not Set.**\nPlease add your API key in ChatbotScreen.js.';
    }

    // Mula dengan model yang terakhir berjaya, kemudian baki senarai mengikut turutan
    const queue = lastGoodModel
      ? [lastGoodModel, ...GEMINI_MODELS.filter((m) => m !== lastGoodModel)]
      : GEMINI_MODELS;

    let lastError = null;

    for (const model of queue) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: 'user', parts: [{ text: userQuery }] }],
          }),
        });

        const data = await response.json();

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          lastGoodModel = model;
          return reply;
        }

        if (data.error) {
          lastError = data.error;
          if (lastGoodModel === model) lastGoodModel = null;
          if (RETRY_CODES.includes(data.error.code)) continue; // cuba model seterusnya
          return `Error (${data.error.code}): ${data.error.message}`;
        }

        // Tiada jawapan (contoh: disekat penapis keselamatan)
        return lang === 'ms'
          ? 'Maaf, saya tidak dapat menghasilkan jawapan buat masa ini.'
          : 'Sorry, I am unable to generate an answer right now.';
      } catch (error) {
        lastError = error;
      }
    }

    // Semua model gagal
    if (lastError && lastError.code === 429) {
      return lang === 'ms'
        ? 'Maaf, pembantu AI sedang sibuk buat masa ini. Sila cuba lagi sebentar lagi. 🙏'
        : 'Sorry, the assistant is busy right now. Please try again in a moment. 🙏';
    }
    if (lastError && lastError.message) return `Error: ${lastError.message}`;
    return lang === 'ms'
      ? 'Masalah sambungan rangkaian. Sila semak internet anda dan cuba lagi.'
      : 'Network connection problem. Please check your internet and try again.';
  };

  const handleSend = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    const aiReplyText = await fetchGeminiResponse(text.trim());

    const botMsg = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: aiReplyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {t('homechef_ai_gemini')}
          </Text>
          <View style={styles.onlineBadgeContainer}>
            <View style={styles.onlineDot} />
            <Text style={[styles.onlineText, { color: theme.subText }]}>
              Powered by Gemini
            </Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isBot = item.sender === 'bot';
            return (
              <View
                style={[
                  styles.messageBubbleContainer,
                  isBot ? styles.botAlign : styles.userAlign,
                ]}
              >
                {isBot && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isBot
                      ? [styles.botBubble, { backgroundColor: theme.card, borderColor: theme.border }]
                      : styles.userBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isBot ? { color: theme.text } : styles.userMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      isBot ? { color: theme.subText } : styles.userTimeText,
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF6B35" />
            <Text style={[styles.loadingText, { color: theme.subText }]}>
              {lang === 'ms' ? 'Gemini AI sedang menaip...' : 'Gemini AI is typing...'}
            </Text>
          </View>
        )}

        {/* Input Bar (Tanpa Butang Mikrofon) */}
        <View
          style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
            ]}
            placeholder={
              lang === 'ms' ? 'Tanya Gemini apa sahaja...' : 'Ask Gemini anything...'
            }
            placeholderTextColor={theme.subText}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  onlineBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '500',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '82%',
  },
  botAlign: {
    alignSelf: 'flex-start',
  },
  userAlign: {
    alignSelf: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botBubble: {
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#FF6B35',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTimeText: {
    color: '#FFFFFF90',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    height: 44,
    paddingHorizontal: 16,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 1,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
});