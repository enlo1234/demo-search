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
  },
  {
    id: '9',
    title: 'Circular Economy Initiatives',
    description: 'Implementation of circular economic models in various industries.'
  },
  {
    id: '10',
    title: 'Economic Recovery Strategies',
    description: 'Post-pandemic economic recovery plans and their effectiveness.'
  },
  {
    id: '11',
    title: 'Sharing Economy Platforms',
    description: 'Analysis of peer-to-peer economic models and their market impact.'
  },
  {
    id: '12',
    title: 'Economic Inequality Report',
    description: 'Study on global wealth distribution and economic disparities.'
  },
  {
    id: '13',
    title: 'Blue Economy Opportunities',
    description: 'Sustainable use of ocean resources for economic growth.'
  },
  {
    id: '14',
    title: 'Behavioral Economics Study',
    description: 'How psychological factors influence economic decision-making.'
  },
  {
    id: '15',
    title: 'Gig Economy Analysis',
    description: 'Impact of freelance and temporary work on the global economy.'
  },
  {
    id: '16',
    title: 'Economic Innovation Index',
    description: 'Measuring technological advancement and economic progress.'
  },
  {
    id: '17',
    title: 'Rural Economy Development',
    description: 'Strategies for boosting economic growth in rural areas.'
  },
  {
    id: '18',
    title: 'Knowledge Economy Trends',
    description: 'The role of information and expertise in modern economics.'
  },
  {
    id: '19',
    title: 'Economic Resilience Framework',
    description: 'Building robust economic systems to withstand global challenges.'
  },
  {
    id: '20',
    title: 'Urban Economic Planning',
    description: 'Economic development strategies for metropolitan areas.'
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