import { useState, useEffect, useCallback } from 'react';
import { SearchResult } from '../components/SearchResults';
import { searchMockData } from '../utils/mockData';
import eventBatcher from '../utils/eventBatching';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search to avoid excessive searching
  const debouncedSearch = useCallback((searchQuery: string) => {
    setIsLoading(true);
    
    // Simulate network delay
    const timer = setTimeout(() => {
      const searchResults = searchMockData(searchQuery);
      setResults(searchResults);
      setIsLoading(false);
      
      // Log the search event with ISO timestamp
      const timestamp = new Date().toISOString();
      
      // Log individual search event
      eventBatcher.addEvent({
        query: searchQuery,
        timestamp
      });

      // Let the IntersectionObserver handle visible results naturally
      eventBatcher.updateVisibleResults([], timestamp);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to handle search when query changes
  useEffect(() => {
    if (query.trim()) {
      const cleanup = debouncedSearch(query);
      return cleanup;
    } else {
      setResults([]);
    }
  }, [query, debouncedSearch]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  return {
    query,
    results,
    isLoading,
    handleSearch
  };
}