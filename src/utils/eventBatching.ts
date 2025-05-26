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
  private stabilityTimer: NodeJS.Timeout | null = null;
  private seenDuringChange: Map<string, { title: string; position: number }> = new Map();
  private alreadyLoggedItems: Set<string> = new Set(); // Track items that have been logged

  constructor() {
    window.addEventListener('resultClick', ((event: CustomEvent) => {
      this.logVisibleResults('click', true); // Added true parameter to force logging
    }) as EventListener);

    window.addEventListener('resultVisible', ((event: CustomEvent) => {
      const { result, index } = event.detail;
      const itemData = {
        title: result.title,
        position: index + 1
      };
      
      this.visibleResults.set(result.id, itemData);
      
      if (this.isViewportChanging && !this.alreadyLoggedItems.has(result.id)) {
        // Only store if not previously logged
        this.seenDuringChange.set(result.id, itemData);
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

    // Add beforeunload event listener
    window.addEventListener('beforeunload', () => {
      this.logVisibleResults('exit', true); // Added true parameter to force logging
    });
  }

  private handleViewportChange() {
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
    }

    if (!this.isViewportChanging) {
      this.isViewportChanging = true;
      this.seenDuringChange.clear();
      
      // Initialize seenDuringChange with currently visible results that haven't been logged
      this.visibleResults.forEach((data, id) => {
        if (!this.alreadyLoggedItems.has(id)) {
          this.seenDuringChange.set(id, data);
        }
      });
    }

    this.stabilityTimer = setTimeout(() => {
      this.isViewportChanging = false;
      this.logBatchedResults();
    }, 1000);
  }

  addEvent(event: SearchEvent): void {
    console.log('[EVENT] search', event);
    // Reset logged items when new search occurs
    this.alreadyLoggedItems.clear();
  }

  updateVisibleResults(results: Array<{ id: string; title: string }>, timestamp: string): void {
    this.seenDuringChange.clear();
    this.alreadyLoggedItems.clear(); // Reset logged items for new search
  }

  private logBatchedResults() {
    const batchedResults = Array.from(this.seenDuringChange.entries())
      .filter(([id]) => !this.alreadyLoggedItems.has(id))
      .map(([id, data]) => {
        this.alreadyLoggedItems.add(id); // Mark as logged
        return {
          id,
          title: data.title,
          position: data.position
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

    this.seenDuringChange.clear();
  }

  private logVisibleResults(trigger: 'click' | 'exit', forceLog: boolean = false): void {
    const visibleResultsArray = Array.from(this.visibleResults.entries())
      .filter(([id]) => forceLog || !this.alreadyLoggedItems.has(id))
      .map(([id, data]) => {
        if (!forceLog) {
          this.alreadyLoggedItems.add(id); // Only mark as logged if not force logging
        }
        return {
          id,
          title: data.title,
          position: data.position
        };
      });

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