import { SearchResult } from '../components/SearchResults';

// Mock database of search results
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Global Economic Trends 2025',
    description: 'Analysis of emerging economic trends and their impact on global markets.'
  },
  {
    id: '2',
    title: 'Sustainable Finance Report',
    description: 'Comprehensive overview of ESG investing and sustainable financial practices.'
  },
  {
    id: '3',
    title: 'Digital Economy Evolution',
    description: 'How digital transformation is reshaping traditional economic models.'
  },
  {
    id: '4',
    title: 'Cryptocurrency Market Analysis',
    description: 'In-depth review of crypto markets and their integration into the global economy.'
  },
  {
    id: '5',
    title: 'Economic Policy Updates',
    description: 'Latest changes in monetary and fiscal policies affecting global markets.'
  },
  {
    id: '6',
    title: 'Emerging Markets Outlook',
    description: 'Growth prospects and challenges in developing economies for 2025.'
  },
  {
    id: '7',
    title: 'Green Economy Transition',
    description: 'How sustainable practices are transforming traditional industries.'
  },
  {
    id: '8',
    title: 'AI Impact on Economy',
    description: 'Economic implications of artificial intelligence and automation.'
  }
];

// Function to filter mock results based on search query
export const searchMockData = (query: string): SearchResult[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockResults.filter(
    (result) =>
      result.title.toLowerCase().includes(lowercaseQuery) ||
      result.description.toLowerCase().includes(lowercaseQuery)
  );
};