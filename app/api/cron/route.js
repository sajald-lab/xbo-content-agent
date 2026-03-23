import { researchTrends, generatePosts } from "../../../lib/claude.js";
import { updateTrends, updatePosts } from "../../../lib/store.js";

export var maxDuration = 60;

export function GET() {
  return researchTrends().then(function(trendData) {
    updateTrends(trendData);
    return new Promise(function(r) { setTimeout(r, 3000); }).then(function() {
      return generatePosts(trendData.trends || []);
    });
  }).then(function(postData) {
    updatePosts(postData.posts || []);
    return Response.json({ ok: true, time: new Date().toISOString() });
  }).catch(function(err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  });
}
