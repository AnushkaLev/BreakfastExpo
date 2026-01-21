import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { BreakfastEntry } from '../types';
import { StarRating } from './StarRating';
import {
  deleteBreakfastEntry,
  updateBreakfastEntry,
} from '../services/storage';

interface EntryDetailModalProps {
  visible: boolean;
  entry: BreakfastEntry | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  visible,
  entry,
  onClose,
  onUpdate,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!entry) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this breakfast entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteBreakfastEntry(entry.id);
              onUpdate();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Breakfast Details</Text>
            <View style={styles.placeholder} />
          </View>

          {entry.photoUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: entry.photoUri }} style={styles.image} />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Text style={styles.sectionContent}>{formatDate(entry.timestamp)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <StarRating rating={entry.rating} onRatingChange={() => {}} size={30} />
          </View>

          {entry.primaryLabel && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Food Type</Text>
              <Text style={styles.sectionContent}>{entry.primaryLabel}</Text>
            </View>
          )}

          {entry.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.sectionContent}>{entry.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.deleteButtonText}>
              {deleting ? 'Deleting...' : 'Delete Entry'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

