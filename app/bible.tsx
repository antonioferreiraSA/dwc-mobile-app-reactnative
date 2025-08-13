import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { ArrowLeft, Search, BookOpen, Heart, Bookmark, Clock, X, ChevronLeft, ChevronRight, Share } from 'lucide-react-native';
import { router } from 'expo-router';
import { useBible } from '@/hooks/useBible';

export default function BibleScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [verseOfDay, setVerseOfDay] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [bookChapters, setBookChapters] = useState<any[]>([]);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [activeTab, setActiveTab] = useState<'old' | 'new'>('new');
  const { 
    books, 
    versions, 
    selectedVersion, 
    loading, 
    error, 
    setSelectedVersion,
    fetchChapters,
    fetchChapter,
    searchVerses,
    getVerseOfTheDay 
  } = useBible();

  React.useEffect(() => {
    loadVerseOfDay();
  }, []);

  const loadVerseOfDay = async () => {
    const verse = await getVerseOfTheDay();
    setVerseOfDay(verse);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await searchVerses(searchQuery);
    setSearchResults(results);
  };

  const handleBookPress = async (book: any) => {
    try {
      setLoadingChapter(true);
      const chapters = await fetchChapters(book.id);
      if (chapters.length > 0) {
        setSelectedBook(book);
        setBookChapters(chapters);
        // Load first chapter by default
        const firstChapter = await fetchChapter(chapters[0].id);
        if (firstChapter) {
          setSelectedChapter(firstChapter);
          setShowChapterModal(true);
          setShowBooksModal(false);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load book content');
    } finally {
      setLoadingChapter(false);
    }
  };

  const handleChapterChange = async (chapterId: string) => {
    try {
      setLoadingChapter(true);
      const chapter = await fetchChapter(chapterId);
      if (chapter) {
        setSelectedChapter(chapter);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load chapter');
    } finally {
      setLoadingChapter(false);
    }
  };

  const closeChapterModal = () => {
    setShowChapterModal(false);
    setSelectedBook(null);
    setSelectedChapter(null);
    setBookChapters([]);
  };

  const getCurrentChapterIndex = () => {
    if (!selectedChapter || !bookChapters.length) return -1;
    return bookChapters.findIndex(ch => ch.id === selectedChapter.id);
  };

  const goToPreviousChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      handleChapterChange(bookChapters[currentIndex - 1].id);
    }
  };

  const goToNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < bookChapters.length - 1) {
      handleChapterChange(bookChapters[currentIndex + 1].id);
    }
  };

  const handleVersePress = (verse: any) => {
    Alert.alert(
      verse.reference,
      verse.content.replace(/<[^>]*>/g, ''),
      [{ text: 'OK' }]
    );
  };

  const oldTestamentBooks = books.filter(book => {
    const oldTestamentIds = [
      'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
      '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
      'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
      'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
    ];
    return oldTestamentIds.includes(book.id);
  });

  const newTestamentBooks = books.filter(book => {
    const newTestamentIds = [
      'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
      'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
      '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
    ];
    return newTestamentIds.includes(book.id);
  });

  const displayBooks = activeTab === 'old' ? oldTestamentBooks : newTestamentBooks;

  if (error && !books.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bible</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <BookOpen size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>Bible Content Loading</Text>
          <Text style={styles.errorText}>
            The Bible content is being loaded. Please check your internet connection and try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bible</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search the Bible..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Verse of the Day */}
        {verseOfDay && (
          <TouchableOpacity style={styles.verseOfDayCard}>
            <View style={styles.verseOfDayHeader}>
              <Text style={styles.verseOfDayLabel}>VERSE OF THE DAY</Text>
              <Heart size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.verseOfDayText}>
              {verseOfDay.content.replace(/<[^>]*>/g, '')}
            </Text>
            <Text style={styles.verseOfDayReference}>{verseOfDay.reference}</Text>
          </TouchableOpacity>
        )}

        {/* Bible Version Selector */}
        {versions.length > 0 && (
          <View style={styles.versionContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {versions.slice(0, 5).map((version) => (
                <TouchableOpacity
                  key={version.id}
                  style={[
                    styles.versionChip,
                    selectedVersion === version.id && styles.versionChipActive
                  ]}
                  onPress={() => setSelectedVersion(version.id)}
                >
                  <Text style={[
                    styles.versionChipText,
                    selectedVersion === version.id && styles.versionChipTextActive
                  ]}>
                    {version.abbreviation}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchResults.map((verse, index) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultCard}
                onPress={() => handleVersePress(verse)}
              >
                <Text style={styles.searchResultReference}>{verse.reference}</Text>
                <Text style={styles.searchResultText} numberOfLines={3}>
                  {verse.content.replace(/<[^>]*>/g, '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Heart size={24} color="#DC2626" />
            </View>
            <Text style={styles.quickActionTitle}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Bookmark size={24} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionTitle}>Bookmarks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Clock size={24} color="#059669" />
            </View>
            <Text style={styles.quickActionTitle}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Bible Books */}
        <View style={styles.booksSection}>
          <View style={styles.booksSectionHeader}>
            <Text style={styles.sectionTitle}>Books of the Bible</Text>
            <TouchableOpacity 
              style={styles.browseAllButton}
              onPress={() => setShowBooksModal(true)}
            >
              <Text style={styles.browseAllText}>Browse All</Text>
            </TouchableOpacity>
          </View>

          {/* Popular Books Preview */}
          <View style={styles.popularBooksContainer}>
            <Text style={styles.popularBooksTitle}>Popular Books</Text>
            <View style={styles.popularBooksGrid}>
              {books.slice(0, 6).map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.popularBookCard}
                  onPress={() => handleBookPress(book)}
                >
                  <Text style={styles.popularBookName}>{book.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Bible content...</Text>
          </View>
        )}
      </ScrollView>

      {/* Books Browser Modal */}
      <Modal
        visible={showBooksModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBooksModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBooksModal(false)} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Books of the Bible</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {/* Testament Tabs */}
          <View style={styles.testamentTabs}>
            <TouchableOpacity
              style={[styles.testamentTab, activeTab === 'old' && styles.testamentTabActive]}
              onPress={() => setActiveTab('old')}
            >
              <Text style={[styles.testamentTabText, activeTab === 'old' && styles.testamentTabTextActive]}>
                Old Testament ({oldTestamentBooks.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testamentTab, activeTab === 'new' && styles.testamentTabActive]}
              onPress={() => setActiveTab('new')}
            >
              <Text style={[styles.testamentTabText, activeTab === 'new' && styles.testamentTabTextActive]}>
                New Testament ({newTestamentBooks.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.booksGrid}>
              {displayBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.bookCard}
                  onPress={() => handleBookPress(book)}
                >
                  <View style={styles.bookCardContent}>
                    <Text style={styles.bookName}>{book.name}</Text>
                    <Text style={styles.bookNameLong}>{book.nameLong}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Chapter Reading Modal */}
      <Modal
        visible={showChapterModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeChapterModal}
      >
        <View style={styles.readerContainer}>
          <View style={styles.readerHeader}>
            <TouchableOpacity onPress={closeChapterModal} style={styles.readerCloseButton}>
              <X size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.readerHeaderCenter}>
              <Text style={styles.readerTitle}>
                {selectedBook?.name} {selectedChapter?.number}
              </Text>
              <Text style={styles.readerSubtitle}>
                {versions.find(v => v.id === selectedVersion)?.abbreviation || 'ESV'}
              </Text>
            </View>
            <TouchableOpacity style={styles.readerShareButton}>
              <Share size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Chapter Navigation */}
          <View style={styles.chapterNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, getCurrentChapterIndex() === 0 && styles.navButtonDisabled]}
              onPress={goToPreviousChapter}
              disabled={getCurrentChapterIndex() === 0}
            >
              <ChevronLeft size={20} color={getCurrentChapterIndex() === 0 ? "#9CA3AF" : "#1E3A8A"} />
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.chapterSelector}
              contentContainerStyle={styles.chapterSelectorContent}
            >
              {bookChapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  style={[
                    styles.chapterButton,
                    selectedChapter?.id === chapter.id && styles.chapterButtonActive
                  ]}
                  onPress={() => handleChapterChange(chapter.id)}
                >
                  <Text style={[
                    styles.chapterButtonText,
                    selectedChapter?.id === chapter.id && styles.chapterButtonTextActive
                  ]}>
                    {chapter.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.navButton, getCurrentChapterIndex() === bookChapters.length - 1 && styles.navButtonDisabled]}
              onPress={goToNextChapter}
              disabled={getCurrentChapterIndex() === bookChapters.length - 1}
            >
              <ChevronRight size={20} color={getCurrentChapterIndex() === bookChapters.length - 1 ? "#9CA3AF" : "#1E3A8A"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.readerContent} showsVerticalScrollIndicator={false}>
            {loadingChapter ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading chapter...</Text>
              </View>
            ) : selectedChapter ? (
              <View style={styles.chapterContent}>
                <Text style={styles.chapterText}>
                  {selectedChapter.content.replace(/<[^>]*>/g, '')}
                </Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>No chapter content available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  verseOfDayCard: {
    backgroundColor: '#1E3A8A',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  verseOfDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseOfDayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  verseOfDayText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  verseOfDayReference: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
  },
  versionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  versionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  versionChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  versionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  versionChipTextActive: {
    color: '#FFFFFF',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  booksSection: {
    marginBottom: 32,
  },
  booksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  browseAllButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  browseAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  popularBooksContainer: {
    paddingHorizontal: 16,
  },
  popularBooksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  popularBooksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularBookCard: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popularBookName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  searchResultCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResultReference: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  searchResultText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  testamentTabs: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  testamentTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testamentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  testamentTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  testamentTabTextActive: {
    color: '#1E3A8A',
  },
  booksGrid: {
    gap: 8,
  },
  bookCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  bookCardContent: {
    padding: 16,
  },
  bookName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookNameLong: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Reader Styles
  readerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  readerCloseButton: {
    padding: 8,
  },
  readerHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  readerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  readerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  readerShareButton: {
    padding: 8,
  },
  chapterNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  chapterSelector: {
    flex: 1,
    marginHorizontal: 16,
  },
  chapterSelectorContent: {
    alignItems: 'center',
    gap: 8,
  },
  chapterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chapterButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  chapterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  chapterButtonTextActive: {
    color: '#FFFFFF',
  },
  readerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chapterContent: {
    paddingVertical: 24,
  },
  chapterText: {
    fontSize: 18,
    color: '#1F2937',
    lineHeight: 36,
    marginBottom: 24,
  },
});