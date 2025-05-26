import React from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import { useSearch } from './hooks/useSearch';
import { Search } from 'lucide-react';

function App() {
  const { query, results, isLoading, handleSearch } = useSearch();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-white shadow-sm py-6">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center text-blue-600 mr-2">
            <Search size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Demo</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="max-w-3xl w-full text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Search Events</h2>
          <p className="text-gray-600 mb-4">
            Enter the only available search term 'economy' below and check the batch event.</p>
          <p className="text-gray-600 mb-4"> Returned search result items within the viewport will be logged and pushed:
            <ul className="list-disc text-left max-w-md mx-auto mt-2 space-y-1">
              <li>When clicking a result</li>
              <li>When closing the window/tab</li>
              <li>1 second after the viewport becomes stable</li>
            </ul>
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <SearchResults 
          results={results} 
          isLoading={isLoading} 
          query={query}
        />
        
        {results.length > 0 && !isLoading && (
          <div className="mt-6 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            <strong>{results.length} results</strong> for "{query}" logged to console. Open DevTools to view the event batch.
          </div>
        )}
      </main>
      
      <footer className="w-full py-6 bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Events are logged to the console. Press F12 to view them.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;