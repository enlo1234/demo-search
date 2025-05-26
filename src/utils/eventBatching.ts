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
  private viewportChangeTimeout: NodeJS.Timeout | null = null;
  private readonly VIEWPORT_DELAY = 5000; // 5 seconds delay after viewport change

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
      this.scheduleViewportBatch();
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
      this.scheduleViewportBatch();
    }) as EventListener);
  }

  private scheduleViewportBatch() {
    // Reset the timeout on each viewport change
    if (this.viewportChangeTimeout) {
      clearTimeout(this.viewportChangeTimeout);
    }

    // Schedule new batch after VIEWPORT_DELAY
    this.viewportChangeTimeout = setTimeout(() => {
      this.logVisibleResults('viewport_change');
    }, this.VIEWPORT_DELAY);
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.visibleResults.clear();
    results.forEach((result, index) => {
      this.visibleResults.set(result.id, { title: result.title, position: index + 1 });
    });
  }

  private logVisibleResults(trigger: 'viewport_change' | 'click'): void {
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
    }
  }
}

const eventBatcher = new EventBatcher();

export default eventBatcher;