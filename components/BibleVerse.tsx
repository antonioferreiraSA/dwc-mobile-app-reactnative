import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, Share } from 'lucide-react-native';

interface BibleVerseProps {
  verse: string;
  reference: string;
  theme?: 'light' | 'dark';
}

export default function BibleVerse({ verse, reference, theme = 'light' }: BibleVerseProps) {
  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <BookOpen size={20} color={theme === 'dark' ? '#E0E7FF' : '#1E3A8A'} />
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Share size={16} color={theme === 'dark' ? '#E0E7FF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.verse, theme === 'dark' && styles.darkVerse]}>
        "{verse}"
      </Text>
      
      <Text style={[styles.reference, theme === 'dark' && styles.darkReference]}>
        {reference}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  darkContainer: {
    backgroundColor: '#1E3A8A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
  },
  verse: {
    fontSize: 18,
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  darkVerse: {
    color: '#FFFFFF',
  },
  reference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
  },
  darkReference: {
    color: '#C7D2FE',
  },
});