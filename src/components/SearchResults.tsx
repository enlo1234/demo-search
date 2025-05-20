import React, { useRef, useEffect } from 'react';
import { useInView } from '../hooks/useInView';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading, query }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mt-8 animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="mb-4 bg-gray-100 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="w-full max-w-2xl mt-8 text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-8 space-y-4">
      {results.map((result, index) => (
        <SearchResultItem key={result.id} result={result} index={index} />
      ))}
    </div>
  );
};

interface SearchResultItemProps {
  result: SearchResult;
  index: number;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref);

  useEffect(() => {
    if (isVisible) {
      window.dispatchEvent(new CustomEvent('resultVisible', {
        detail: { result, index }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('resultHidden', {
        detail: { result, index }
      }));
    }
  }, [isVisible, result, index]);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('resultClick', {
      detail: { result, index }
    }));
  };

  return (
    <div 
      ref={ref}
      onClick={handleClick}
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <h2 className="text-lg font-medium text-gray-800 mb-1">{result.title}</h2>
      <p className="text-gray-600">{result.description}</p>
    </div>
  );
};

export default SearchResults;