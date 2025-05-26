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
  private isViewportChanging: boolean = false;
  private viewportChangeTimer: NodeJS.Timeout | null = null;
  private batchedDuringChange: Set<string> = new Set();
  private stabilityTimer: NodeJS.Timeout | null = null;

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
      
      if (this.isViewportChanging) {
        this.batchedDuringChange.add(result.id);
      }
      this.handleViewportChange();
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
      this.handleViewportChange();
    }) as EventListener);

    window.addEventListener('scroll', () => {
      this.handleViewportChange();
    }, { passive: true });
  }

  private handleViewportChange() {
    // Clear any existing stability timer
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
    }

    // Mark viewport as changing if not already
    if (!this.isViewportChanging) {
      this.isViewportChanging = true;
    }

    // Set new stability timer
    this.stabilityTimer = setTimeout(() => {
      // If we reach here, viewport has been stable for 3 seconds
      this.isViewportChanging = false;
      this.logBatchedResults();
    }, 3000);
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    // Let the IntersectionObserver naturally populate the visible results
    this.batchedDuringChange.clear();
  }

  private logBatchedResults() {
    const batchedResults = Array.from(this.batchedDuringChange).map(id => {
      const data = this.visibleResults.get(id);
      return {
        id,
        title: data!.title,
        position: data!.position
      };
    });

    if (batchedResults.length > 0) {
      const batchedEvent: ViewSearchResult = {
        timestamp: new Date().toISOString(),
        count: batchedResults.length,
        results: batchedResults
      };

      console.log('[BATCHED EVENT] view_search_result (viewport_change)', batchedEvent);
    }

    // Clear the batched results after logging
    this.batchedDuringChange.clear();
  }

  private logVisibleResults(trigger: 'click'): void {
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