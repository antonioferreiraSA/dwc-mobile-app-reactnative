import { useState, useEffect } from 'react';

interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  number: string;
  reference: string;
}

interface Verse {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  content: string;
  reference: string;
  verseCount: number;
  copyright: string;
}

interface BibleVersion {
  id: string;
  name: string;
  nameLocal: string;
  abbreviation: string;
  abbreviationLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
  type: string;
  updatedAt: string;
  relatedDbl: string;
  audioBibles: any[];
}

export function useBible() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('de4e12af7f28f599-02'); // English Standard Version
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free API key - you can get your own at https://scripture.api.bible
  const API_KEY = '3a344809563dc88a80807e0284077c7a';
  const BASE_URL = 'https://api.scripture.api.bible/v1';

  const headers = {
    'api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetchBibleVersions();
    fetchBooks();
  }, []);

  const fetchBibleVersions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/bibles`, { headers });
      const data = await response.json();
      if (data.data) {
        setVersions(data.data.filter((version: BibleVersion) => version.language.id === 'eng'));
      }
    } catch (err) {
      console.error('Error fetching Bible versions:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/bibles/${selectedVersion}/books`, { headers });
      const data = await response.json();
      if (data.data) {
        setBooks(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (bookId: string): Promise<Chapter[]> => {
    try {
      const response = await fetch(`${BASE_URL}/bibles/${selectedVersion}/books/${bookId}/chapters`, { headers });
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error('Error fetching chapters:', err);
      return [];
    }
  };

  const fetchChapter = async (chapterId: string): Promise<Verse | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/bibles/${selectedVersion}/chapters/${chapterId}`, { headers });
      const data = await response.json();
      return data.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chapter');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchVerses = async (query: string): Promise<any[]> => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/bibles/${selectedVersion}/search?query=${encodeURIComponent(query)}&limit=20`,
        { headers }
      );
      const data = await response.json();
      return data.data?.verses || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search verses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getVerseOfTheDay = async (): Promise<any> => {
    try {
      // Get a random popular verse
      const popularVerses = [
        'JHN.3.16', // John 3:16
        'PHP.4.13', // Philippians 4:13
        'JER.29.11', // Jeremiah 29:11
        'ROM.8.28', // Romans 8:28
        'PRO.3.5-PRO.3.6', // Proverbs 3:5-6
        'ISA.40.31', // Isaiah 40:31
      ];
      
      const randomVerse = popularVerses[Math.floor(Math.random() * popularVerses.length)];
      const response = await fetch(`${BASE_URL}/bibles/${selectedVersion}/verses/${randomVerse}`, { headers });
      const data = await response.json();
      return data.data || null;
    } catch (err) {
      console.error('Error fetching verse of the day:', err);
      return null;
    }
  };

  return {
    books,
    versions,
    selectedVersion,
    loading,
    error,
    setSelectedVersion,
    fetchBooks,
    fetchChapters,
    fetchChapter,
    searchVerses,
    getVerseOfTheDay,
  };
}