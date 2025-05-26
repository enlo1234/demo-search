interface SearchEvent {
  query: string;
  timestamp: string;
}

interface ViewSearchResult {
  timestamp: string;
  count: number;
  results: Array<{
    id: string;
    title: string;
    position: number;
  }>;
}

class EventBatcher {
  private visibleResults: Map<string, { title: string; position: number }> = new Map();
  private snapshotTimer: NodeJS.Timeout | null = null;
  private alreadyLoggedItems: Set<string> = new Set(); // Track items that have been logged

  constructor() {
    // Handle click events
    window.addEventListener('resultClick', ((event: CustomEvent) => {
      this.logVisibleResults('click');
    }) as EventListener);

    // Handle visibility changes
    window.addEventListener('resultVisible', ((event: CustomEvent) => {
      const { result, index } = event.detail;
      const itemData = {
        title: result.title,
        position: index + 1
      };
      
      this.visibleResults.set(result.id, itemData);
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
    }) as EventListener);

    // Add beforeunload event listener
    window.addEventListener('beforeunload', () => {
      this.logVisibleResults('exit');
    });

    // Start the snapshot timer
    this.startSnapshotTimer();
  }

  private startSnapshotTimer() {
    // Clear existing timer if any
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
    }

    // Create new timer that fires every 3 seconds
    this.snapshotTimer = setInterval(() => {
      this.logSnapshot();
    }, 3000);
  }

  private logSnapshot() {
    const currentVisibleResults = Array.from(this.visibleResults.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        position: data.position
      }));

    // Only log if there are visible results and they're different from what's been logged
    if (currentVisibleResults.length > 0) {
      const visibleIds = new Set(currentVisibleResults.map(result => result.id));
      const hasNewItems = currentVisibleResults.some(result => !this.alreadyLoggedItems.has(result.id));
      
      if (hasNewItems) {
        const batchedEvent: ViewSearchResult = {
          timestamp: new Date().toISOString(),
          count: currentVisibleResults.length,
          results: currentVisibleResults
        };

        console.log('[BATCHED EVENT] view_search_result (snapshot)', batchedEvent);
        
        // Update logged items
        currentVisibleResults.forEach(result => {
          this.alreadyLoggedItems.add(result.id);
        });
      }
    }
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
    // Reset logged items when new search occurs
    this.alreadyLoggedItems.clear();
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.alreadyLoggedItems.clear(); // Reset logged items for new search
  }

  private logVisibleResults(trigger: 'click' | 'exit'): void {
    const visibleResultsArray = Array.from(this.visibleResults.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        position: data.position
      }));

    if (visibleResultsArray.length > 0) {
      const batchedEvent: ViewSearchResult = {
        timestamp: new Date().toISOString(),
        count: visibleResultsArray.length,
        results: visibleResultsArray
      };

      console.log(`[BATCHED EVENT] view_search_result (${trigger})`, batchedEvent);
      
      // Update logged items after click or exit event
      visibleResultsArray.forEach(result => {
        this.alreadyLoggedItems.add(result.id);
      });
    }
  }
}

const eventBatcher = new EventBatcher();

export default eventBatcher;