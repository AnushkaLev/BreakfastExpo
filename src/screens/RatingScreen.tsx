import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BreakfastEntry } from '../types';
import { StarRating } from '../components/StarRating';
import { saveBreakfastEntry } from '../services/storage';
import { formatDateKey } from '../utils/dateUtils';
import { suggestPrimaryLabel } from '../utils/imageDetection';

type RatingScreenRouteProp = RouteProp<RootStackParamList, 'Rating'>;
type RatingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rating'>;

export const RatingScreen: React.FC = () => {
  const route = useRoute<RatingScreenRouteProp>();
  const navigation = useNavigation<RatingScreenNavigationProp>();
  const { photoUri } = route.params || {};

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [primaryLabel, setPrimaryLabel] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Auto-suggest label when notes change
    if (notes) {
      const suggested = suggestPrimaryLabel(notes);
      if (suggested && !primaryLabel) {
        setPrimaryLabel(suggested);
      }
    }
  }, [notes]);

  const handleSave = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please rate your breakfast before saving.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const entry: BreakfastEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: now.getTime(),
        dateKey: formatDateKey(now),
        photoUri: photoUri,
        rating,
        notes: notes.trim() || undefined,
        primaryLabel: primaryLabel.trim() || undefined,
      };

      await saveBreakfastEntry(entry);
      Alert.alert('Saved!', 'Your breakfast has been logged.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save breakfast entry.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Rate Your Breakfast</Text>

          {photoUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: photoUri }} style={styles.image} />
            </View>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <StarRating rating={rating} onRatingChange={setRating} />
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="What did you have? Share your thoughts..."
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.labelSection}>
            <Text style={styles.sectionTitle}>Food Type (optional)</Text>
            <TextInput
              style={styles.labelInput}
              placeholder="e.g., eggs, oatmeal, chia pudding"
              value={primaryLabel}
              onChangeText={setPrimaryLabel}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Breakfast'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  labelSection: {
    marginBottom: 24,
  },
  labelInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  saveButton: {
    backgroundColor: '#FFB800',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999',
  },
});

