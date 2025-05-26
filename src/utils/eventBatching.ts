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
  private lastSnapshotTime: number = Date.now();
  private pendingVisibilityUpdates: Map<string, { title: string; position: number }> = new Map();

  constructor() {
    window.addEventListener('resultClick', ((event: CustomEvent) => {
      this.logVisibleResults('click');
    }) as EventListener);

    window.addEventListener('resultVisible', ((event: CustomEvent) => {
      const { result, index } = event.detail;
      const itemData = {
        title: result.title,
        position: index + 1
      };
      
      this.pendingVisibilityUpdates.set(result.id, itemData);
      this.processVisibilityUpdates();
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
      this.pendingVisibilityUpdates.delete(result.id);
    }) as EventListener);

    window.addEventListener('beforeunload', () => {
      this.logVisibleResults('exit');
    });

    this.startSnapshotTimer();
  }

  private startSnapshotTimer() {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
    }

    this.snapshotTimer = setInterval(() => {
      this.processVisibilityUpdates();
    }, 3000);
  }

  private processVisibilityUpdates() {
    const now = Date.now();
    
    // Add pending items to visible results
    this.pendingVisibilityUpdates.forEach((data, id) => {
      if (!this.alreadySeenItems.has(id)) {
        this.visibleResults.set(id, data);
      }
    });
    this.pendingVisibilityUpdates.clear();

    if (now - this.lastSnapshotTime >= 3000) {
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

        console.log('[BATCHED EVENT] view_search_result (snapshot)', batchedEvent);
        
        newItems.forEach(item => this.alreadySeenItems.add(item.id));
      }
      
      this.lastSnapshotTime = now;
    }
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
    this.alreadySeenItems.clear();
    this.visibleResults.clear();
    this.pendingVisibilityUpdates.clear();
    this.lastSnapshotTime = Date.now();
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.alreadySeenItems.clear();
    this.visibleResults.clear();
    this.pendingVisibilityUpdates.clear();
    this.lastSnapshotTime = Date.now();
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