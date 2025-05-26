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
  private batchTimeout: NodeJS.Timeout | null = null;
  private lastBatchTime: number = 0;
  private readonly BATCH_INTERVAL = 5000; // 5 seconds

  constructor() {
    window.addEventListener('resultClick', ((event: CustomEvent) => {
      this.logVisibleResults('click');
    }) as EventListener);

    window.addEventListener('resultVisible', ((event: CustomEvent) => {
      const { result, index } = event.detail;
      this.visibleResults.set(result.id, {
        title: result.title,
        position: index + 1
      });
      this.scheduleBatch();
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
      this.scheduleBatch();
    }) as EventListener);

    // Start periodic check
    this.startPeriodicCheck();
  }

  private startPeriodicCheck() {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastBatchTime >= this.BATCH_INTERVAL && this.visibleResults.size > 0) {
        this.logVisibleResults('periodic');
      }
    }, this.BATCH_INTERVAL);
  }

  private scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.logVisibleResults('viewport_change');
    }, 100); // Small delay to batch rapid changes
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.visibleResults.clear();
    results.forEach((result, index) => {
      this.visibleResults.set(result.id, { title: result.title, position: index + 1 });
    });
    this.scheduleBatch();
  }

  private logVisibleResults(trigger: 'viewport_change' | 'periodic' | 'click'): void {
    const visibleResultsArray = Array.from(this.visibleResults.entries()).map(([id, data]) => ({
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
      this.lastBatchTime = Date.now();
    }
  }
}

const eventBatcher = new EventBatcher();

export default eventBatcher;