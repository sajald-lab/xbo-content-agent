var store = {
  trends: [],
  posts: [],
  competitors: [],
  calendar: [],
  history: [],
  market_mood: "",
  lastUpdate: null,
  engagementTips: []
};

export function updateTrends(data) {
  store.trends = data.trends || [];
  store.market_mood = data.market_mood || "";
  store.lastUpdate = new Date().toISOString();
}

export function updatePosts(posts) {
  store.posts = posts;
  var now = new Date().toLocaleDateString();
  for (var i = 0; i < posts.length; i++) {
    store.history.push({
      content: posts[i].content,
      platform: posts[i].platform,
      date: now,
      tone: posts[i].tone
    });
  }
  if (store.history.length > 100) {
    store.history = store.history.slice(-100);
  }
}

export function updateCompetitors(comps) {
  store.competitors = comps;
}

export function updateCalendar(cal) {
  store.calendar = cal;
}

export function updateEngagement(tips) {
  store.engagementTips = tips;
}

export function getStore() {
  return JSON.parse(JSON.stringify(store));
}

export function getHistoryContext() {
  if (store.history.length === 0) return "";
  var recent = store.history.slice(-15);
  var summaries = [];
  for (var i = 0; i < recent.length; i++) {
    summaries.push(recent[i].content.substring(0, 60));
  }
  return "PREVIOUSLY POSTED (avoid repeating): " + summaries.join(" | ");
}
