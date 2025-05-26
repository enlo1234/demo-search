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
  private alreadySeenItems: Set<string> = new Set();

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
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
    }

    // Create new timer that fires exactly every 3 seconds
    this.snapshotTimer = setInterval(() => {
      this.logNewVisibleResults();
    }, 3000);
  }

  private logNewVisibleResults() {
    const currentItems = Array.from(this.visibleResults.entries());
    const newItems = currentItems
      .filter(([id]) => !this.alreadySeenItems.has(id))
      .map(([id, data]) => ({
        id,
        title: data.title,
        position: data.position
      }))
      .sort((a, b) => a.position - b.position);

    if (newItems.length > 0) {
      const batchedEvent: ViewSearchResult = {
        timestamp: new Date().toISOString(),
        count: newItems.length,
        results: newItems
      };

      console.log('[BATCHED EVENT] view_search_result (timer)', batchedEvent);
      
      // Mark these items as seen
      newItems.forEach(item => this.alreadySeenItems.add(item.id));
    }
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
    this.alreadySeenItems.clear();
    this.visibleResults.clear();
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.alreadySeenItems.clear();
    this.visibleResults.clear();
  }

  private logVisibleResults(trigger: 'click' | 'exit'): void {
    const visibleResultsArray = Array.from(this.visibleResults.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        position: data.position
      }))
      .sort((a, b) => a.position - b.position);

    if (visibleResultsArray.length > 0) {
      const batchedEvent: ViewSearchResult = {
        timestamp: new Date().toISOString(),
        count: visibleResultsArray.length,
        results: visibleResultsArray
      };

      console.log(`[BATCHED EVENT] view_search_result (${trigger})`, batchedEvent);
    }
  }
}

const eventBatcher = new EventBatcher();

export default eventBatcher;