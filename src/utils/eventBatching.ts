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
  private batchTimeout: number | null = null;
  private stabilityTimeout: number | null = null;
  private hasUserInteracted: boolean = false;
  private isInitialBatchSent: boolean = false;

  constructor() {
    // Track user interactions
    window.addEventListener('click', () => {
      this.hasUserInteracted = true;
      // If batch hasn't been sent yet, send it now
      if (!this.isInitialBatchSent) {
        this.logVisibleResults();
      }
    });

    window.addEventListener('resultVisible', ((event: CustomEvent) => {
      const { result, index } = event.detail;
      this.visibleResults.set(result.id, {
        title: result.title,
        position: index + 1
      });
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
    }) as EventListener);
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    results.forEach((result, index) => {
      this.visibleResults.set(result.id, { title: result.title, position: index + 1 });
    });
  }

  private logVisibleResults(): void {
    if (this.isInitialBatchSent) {
      return;
    }

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

      console.log('[BATCHED EVENT] view_search_result', batchedEvent);
      this.isInitialBatchSent = true;
    }
  }
}

const eventBatcher = new EventBatcher();

export default eventBatcher;