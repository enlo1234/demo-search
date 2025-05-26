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

interface VisibilityData {
  title: string;
  position: number;
  visibleSince: number;
}

class EventBatcher {
  private visibleResults: Map<string, VisibilityData> = new Map();
  private snapshotTimer: NodeJS.Timeout | null = null;
  private alreadySeenItems: Set<string> = new Set();
  private readonly MINIMUM_VISIBILITY_DURATION = 500; // 500ms minimum visibility time

  constructor() {
    window.addEventListener('resultClick', ((event: CustomEvent) => {
      this.logVisibleResults('click');
    }) as EventListener);

    window.addEventListener('resultVisible', ((event: CustomEvent) => {
      const { result, index } = event.detail;
      const itemData: VisibilityData = {
        title: result.title,
        position: index + 1,
        visibleSince: Date.now()
      };
      
      this.visibleResults.set(result.id, itemData);
    }) as EventListener);

    window.addEventListener('resultHidden', ((event: CustomEvent) => {
      const { result } = event.detail;
      this.visibleResults.delete(result.id);
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
      this.logNewVisibleResults();
    }, 3000);
  }

  private logNewVisibleResults() {
    const now = Date.now();
    const currentItems = Array.from(this.visibleResults.entries());
    
    const stableItems = currentItems
      .filter(([id, data]) => {
        const hasBeenVisibleLongEnough = (now - data.visibleSince) >= this.MINIMUM_VISIBILITY_DURATION;
        return hasBeenVisibleLongEnough && !this.alreadySeenItems.has(id);
      })
      .map(([id, data]) => ({
        id,
        title: data.title,
        position: data.position
      }))
      .sort((a, b) => a.position - b.position);

    if (stableItems.length > 0) {
      const batchedEvent: ViewSearchResult = {
        timestamp: new Date().toISOString(),
        count: stableItems.length,
        results: stableItems
      };

      console.log('[BATCHED EVENT] view_search_result (timer)', batchedEvent);
      
      stableItems.forEach(item => this.alreadySeenItems.add(item.id));
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
    const now = Date.now();
    const visibleResultsArray = Array.from(this.visibleResults.entries())
      .filter(([_, data]) => (now - data.visibleSince) >= this.MINIMUM_VISIBILITY_DURATION)
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