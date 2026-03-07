/**
 * Climate Clues Analytics Engine (React Version)
 */
class ClimateAnalytics {
  constructor() {
    this.searchHistory =
      JSON.parse(localStorage.getItem("cc_analytics_search")) || [];
    this.startTime = Date.now();
  }

  trackSearch(city, status) {
    const event = {
      timestamp: new Date().toISOString(),
      city: city,
      status: status, // 'success' or 'error'
      duration: Date.now() - this.startTime,
    };
    this.searchHistory.push(event);
    this.saveAnalytics();
    console.log(`[Analytics] Search tracked: ${city} (${status})`);
  }

  trackError(message) {
    console.error(`[Analytics] Error: ${message}`);
  }

  saveAnalytics() {
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(-100);
    }
    localStorage.setItem(
      "cc_analytics_search",
      JSON.stringify(this.searchHistory),
    );
  }

  getStats() {
    const total = this.searchHistory.length;
    const success = this.searchHistory.filter(
      (s) => s.status === "success",
    ).length;

    return {
      totalSearches: total,
      successRate:
        total > 0 ? ((success / total) * 100).toFixed(1) + "%" : "0%",
      recentCities: [...new Set(this.searchHistory.map((s) => s.city))]
        .reverse()
        .slice(0, 5),
    };
  }
}

export const analytics = new ClimateAnalytics();
