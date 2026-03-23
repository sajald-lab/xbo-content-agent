import { researchTrends, generatePosts } from "../../../lib/claude.js";
import { sendMessage, formatTrendAlert, formatPostDrafts } from "../../../lib/telegram.js";
import { updateTrends, updatePosts } from "../../../lib/store.js";

export var maxDuration = 60;

export function GET(request) {
  return researchTrends().then(function(trendData) {
    updateTrends(trendData);
    var topTrends = (trendData.trends || []).slice(0, 3);
    if (topTrends.length > 0) {
      var trendMsg = "<b>XBO CONTENT AGENT - TREND UPDATE</b>\n---\n\n";
      trendMsg += "Market mood: " + (trendData.market_mood || "N/A") + "\n\n";
      for (var i = 0; i < topTrends.length; i++) {
        trendMsg += formatTrendAlert(topTrends[i]) + "\n\n";
      }
      return sendMessage(trendMsg).then(function() { return trendData; });
    }
    return trendData;
  }).then(function(trendData) {
    return new Promise(function(r) { setTimeout(r, 3000); }).then(function() {
      return generatePosts(trendData.trends || []);
    });
  }).then(function(postData) {
    updatePosts(postData.posts || []);
    return sendMessage(formatPostDrafts(postData.posts || [])).then(function() {
      return Response.json({ ok: true, time: new Date().toISOString() });
    });
  }).catch(function(err) {
    console.error("[CRON] Error:", err.message);
    return sendMessage("Agent Error: " + err.message).then(function() {
      return Response.json({ ok: false, error: err.message }, { status: 500 });
    }).catch(function() {
      return Response.json({ ok: false, error: err.message }, { status: 500 });
    });
  });
}
