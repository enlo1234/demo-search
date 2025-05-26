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
  private lastSnapshotState: string = ''; // Track the last snapshot state

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
      this.checkForChanges();
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
      this.checkForChanges();
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
      this.checkForChanges();
    }, 3000);
  }

  private getCurrentStateHash(): string {
    const sortedResults = Array.from(this.visibleResults.entries())
      .sort(([idA], [idB]) => idA.localeCompare(idB))
      .map(([id, data]) => `${id}:${data.position}`).join('|');
    return sortedResults;
  }

  private checkForChanges() {
    const currentState = this.getCurrentStateHash();
    
    if (currentState !== this.lastSnapshotState && this.visibleResults.size > 0) {
      const visibleResultsArray = Array.from(this.visibleResults.entries())
        .map(([id, data]) => ({
          id,
          title: data.title,
          position: data.position
        }))
        .sort((a, b) => a.position - b.position);

      const batchedEvent: ViewSearchResult = {
        timestamp: new Date().toISOString(),
        count: visibleResultsArray.length,
        results: visibleResultsArray
      };

      console.log('[BATCHED EVENT] view_search_result (snapshot)', batchedEvent);
      this.lastSnapshotState = currentState;
    }
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
    this.lastSnapshotState = ''; // Reset state hash when new search occurs
    this.visibleResults.clear();
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.lastSnapshotState = ''; // Reset state hash for new search
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