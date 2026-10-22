import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppContext } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const BANNED_WORDS = ['bodoh', 'sial', 'babi', 'gila', 'stupid', 'idiot', 'hate', 'anjing'];

const formatIngredientQty = (text, isMetric) => {
  if (isMetric || !text || typeof text !== 'string') return text;

  return text
    .replace(/(\d+(?:\.\d+)?)\s*g\b/gi, (_, p1) => `${(parseFloat(p1) * 0.035274).toFixed(1)} oz`)
    .replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, (_, p1) => `${(parseFloat(p1) * 2.20462).toFixed(1)} lbs`)
    .replace(/(\d+(?:\.\d+)?)\s*ml\b/gi, (_, p1) => `${(parseFloat(p1) * 0.033814).toFixed(1)} fl oz`)
    .replace(/(\d+(?:\.\d+)?)\s*l(?:iter)?\b/gi, (_, p1) => `${(parseFloat(p1) * 4.22675).toFixed(1)} cups`);
};

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe = {} } = route.params || {};
  const { likedRecipes = [], toggleLikeRecipe, isGuest, user, isMetric = true, theme, isDarkMode } = useContext(AppContext);
  const { lang, t } = useLang();

  const isMalay = lang === 'ms' || lang === 'MY' || lang === 'BM';

  const [activeTab, setActiveTab] = useState('ingredients');
  const [commentText, setCommentText] = useState('');
  const [playing, setPlaying] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const recipeId = recipe?.id;

  useEffect(() => {
    if (!recipeId) {
      setLoadingComments(false);
      return;
    }

    setLoadingComments(true);
    const commentsRef = collection(db, 'recipes', recipeId, 'comments');

    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      commentList.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
      });

      setComments(commentList);
      setLoadingComments(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [recipeId]);

  const isLiked = likedRecipes.includes(recipeId);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const recipeImage = recipe?.imageUrl || recipe?.image;
  const youtubeId = recipe?.youtubeId || recipe?.youtube_id;
  const ingredientsData = recipe?.ingredients || [];
  const stepsData = recipe?.steps || recipe?.instructions || [];

  const getIngredientsCount = () => {
    if (Array.isArray(ingredientsData)) {
      return ingredientsData.reduce((acc, curr) => {
        if (typeof curr === 'string') return acc + 1;
        if (curr && typeof curr === 'object') {
          if (Array.isArray(curr.items)) return acc + curr.items.length;
          return acc + Object.keys(curr).length;
        }
        return acc;
      }, 0);
    }
    return 0;
  };

  const displayCalories = recipe?.calories?.toString().includes('kcal')
    ? recipe.calories
    : `${recipe?.calories || 0} kcal`;

  const handleAddComment = async () => {
    if (isGuest || !user) {
      Alert.alert(
        isMalay ? 'Log Masuk Diperlukan' : 'Login Required',
        isMalay
          ? 'Sila log masuk atau daftar akaun untuk meninggalkan komen.'
          : 'Please log in or register to post a comment.'
      );
      return;
    }

    if (!commentText.trim()) return;

    const lowerText = commentText.toLowerCase();
    const containsBadWord = BANNED_WORDS.some((word) => lowerText.includes(word));

    if (containsBadWord) {
      Alert.alert(
        isMalay ? '⚠️ Komen Ditolak' : '⚠️ Comment Blocked',
        isMalay
          ? 'Komen anda mengandungi bahasa yang tidak sopan dan telah disekat.'
          : 'Your comment contains inappropriate language and has been blocked.'
      );
      return;
    }

    try {
      setSubmittingComment(true);
      const commentsRef = collection(db, 'recipes', recipeId, 'comments');

      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.name || user.displayName || (isMalay ? 'Pemasak HomeChef' : 'Home Chef'),
        userPhoto: user.photoURL || null,
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });

      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", isMalay ? "Gagal menghantar komen." : "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId, commentUserId) => {
    const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
    const isOwner = user?.uid === commentUserId;

    if (!isOwner && !isAdmin) {
      Alert.alert("Akses Ditolak", isMalay ? "Anda hanya boleh memadam komen anda sendiri." : "You can only delete your own comments.");
      return;
    }

    Alert.alert(
      isMalay ? "Padam Komen" : "Delete Comment",
      isMalay ? "Adakah anda pasti ingin memadam komen ini?" : "Are you sure you want to delete this comment?",
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: isMalay ? "Padam" : "Delete",
          style: 'destructive',
          onPress: async () => {
            try {
              const commentDocRef = doc(db, 'recipes', recipeId, 'comments', commentId);
              await deleteDoc(commentDocRef);
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert("Error", isMalay ? "Gagal memadam komen." : "Failed to delete comment.");
            }
          }
        }
      ]
    );
  };

  const renderIngredients = () => {
    if (!ingredientsData) return null;

    if (Array.isArray(ingredientsData)) {
      return ingredientsData.map((item, idx) => {
        if (typeof item === 'string') {
          return (
            <View key={idx} style={styles.ingredientRow}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary || '#FF6B35'} />
              <Text style={[styles.ingredientText, { color: theme.text }]}>{formatIngredientQty(item, isMetric)}</Text>
            </View>
          );
        }

        if (typeof item === 'object' && item !== null) {
          const groupTitle = item.group || item.title || item.name;
          const groupItems = item.items || item.list || [];

          return (
            <View key={idx} style={styles.groupContainer}>
              {groupTitle ? <Text style={styles.groupHeaderTitle}>{groupTitle}</Text> : null}
              {Array.isArray(groupItems) ? (
                groupItems.map((subIng, subIdx) => (
                  <View key={subIdx} style={styles.ingredientRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.primary || '#FF6B35'}
                    />
                    <Text style={[styles.ingredientText, { color: theme.text }]}>
                      {formatIngredientQty(String(subIng), isMetric)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.ingredientRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.primary || '#FF6B35'}
                  />
                  <Text style={[styles.ingredientText, { color: theme.text }]}>
                    {formatIngredientQty(String(groupItems), isMetric)}
                  </Text>
                </View>
              )}
            </View>
          );
        }

        return null;
      });
    }

    return null;
  };

  const renderSteps = () => {
    if (!stepsData) return null;

    let stepCounter = 1;

    if (Array.isArray(stepsData)) {
      return stepsData.map((item, idx) => {
        if (typeof item === 'string') {
          return (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{stepCounter++}</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.text }]}>{item}</Text>
            </View>
          );
        }

        if (typeof item === 'object' && item !== null) {
          const groupTitle = item.group || item.title || item.name;
          const groupItems = item.items || item.list || [];

          return (
            <View key={idx} style={styles.groupContainer}>
              {groupTitle ? <Text style={styles.groupHeaderTitle}>{groupTitle}</Text> : null}
              {Array.isArray(groupItems) ? (
                groupItems.map((subStep, subIdx) => (
                  <View key={subIdx} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{stepCounter++}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.text }]}>{String(subStep)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{stepCounter++}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: theme.text }]}>{String(groupItems)}</Text>
                </View>
              )}
            </View>
          );
        }

        return null;
      });
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.inputBg }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {recipe?.title || (isMalay ? 'Butiran Resipi' : 'Recipe Detail')}
        </Text>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.inputBg }]}
          onPress={() => recipeId && toggleLikeRecipe(recipeId)}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? '#EF4444' : theme.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {youtubeId ? (
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={230}
              play={playing}
              videoId={youtubeId}
              onChangeState={onStateChange}
            />
          </View>
        ) : recipeImage ? (
          <Image source={{ uri: recipeImage }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage, { backgroundColor: theme.inputBg }]}>
            <Text style={{ color: theme.subText, fontSize: 12 }}>
              {isMalay ? 'Tiada Gambar' : 'No Image'}
            </Text>
          </View>
        )}

        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary || '#FF6B35'} />
            <Text style={[styles.statValue, { color: theme.text }]}>{recipe?.prepTime || '15 mins'}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{isMalay ? 'Masa' : 'Time'}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={20} color={COLORS.primary || '#FF6B35'} />
            <Text style={[styles.statValue, { color: theme.text }]}>{displayCalories}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{isMalay ? 'Kalori' : 'Calories'}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.statItem}>
            <Ionicons name="fitness-outline" size={20} color={COLORS.primary || '#FF6B35'} />
            <Text style={[styles.statValue, { color: theme.text }]}>{formatIngredientQty(recipe?.protein || '20g', isMetric)}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{t('protein')}</Text>
          </View>
        </View>

        <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#E5E7EB' }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ingredients' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabBtnText, { color: theme.subText }, activeTab === 'ingredients' && styles.tabBtnTextActive]}>
              {isMalay ? 'Bahan' : 'Ingredients'} ({getIngredientsCount()})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'steps' && styles.tabBtnActive]}
            onPress={() => setActiveTab('steps')}
          >
            <Text style={[styles.tabBtnText, { color: theme.subText }, activeTab === 'steps' && styles.tabBtnTextActive]}>
              {isMalay ? 'Langkah' : 'Steps'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'comments' && styles.tabBtnActive]}
            onPress={() => setActiveTab('comments')}
          >
            <Text style={[styles.tabBtnText, { color: theme.subText }, activeTab === 'comments' && styles.tabBtnTextActive]}>
              {isMalay ? 'Komen' : 'Comments'} ({comments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'ingredients' && (
          <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>{renderIngredients()}</View>
        )}

        {activeTab === 'steps' && <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>{renderSteps()}</View>}

        {activeTab === 'comments' && (
          <View style={[styles.sectionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                placeholder={
                  isMalay ? 'Tulis komen yang sopan...' : 'Write a moderated comment...'
                }
                placeholderTextColor={theme.subText}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment} disabled={submittingComment}>
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {loadingComments ? (
              <ActivityIndicator size="small" color={COLORS.primary || '#FF6B35'} style={{ marginVertical: 20 }} />
            ) : comments.length > 0 ? (
              comments.map((item) => {
                const isOwner = user?.uid === item.userId;
                const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
                const canDelete = isOwner || isAdmin;

                return (
                  <View key={item.id} style={[styles.commentCard, { backgroundColor: theme.inputBg }]}>
                    <View style={styles.commentHeader}>
                      <View style={styles.authorRow}>
                        {item.userPhoto ? (
                          <Image source={{ uri: item.userPhoto }} style={styles.commentAvatar} />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={12} color="#FF6B35" />
                          </View>
                        )}
                        <Text style={[styles.commentAuthor, { color: theme.text }]}>{item.userName}</Text>
                      </View>

                      {canDelete && (
                        <TouchableOpacity onPress={() => handleDeleteComment(item.id, item.userId)}>
                          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.commentBody, { color: theme.text }]}>{item.text}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyCommentsText, { color: theme.subText }]}>
                {isMalay ? 'Belum ada komen. Jadilah yang pertama!' : 'No comments yet. Be the first to comment!'}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 230,
    resizeMode: 'cover',
  },
  videoContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    borderRadius: 25,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary || '#FF6B35',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionBox: {
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    borderRadius: SIZES.radius,
    padding: 16,
    borderWidth: 1,
    ...SHADOWS.light,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary || '#FF6B35',
    marginBottom: 8,
    marginTop: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary || '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    fontSize: 12,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary || '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCommentsText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});