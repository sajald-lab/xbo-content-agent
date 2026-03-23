import { researchTrends, generatePosts, analyzeCompetitors, generateCalendar } from "../../../lib/claude.js";
import { updateTrends, updatePosts, updateCompetitors, updateCalendar, getStore } from "../../../lib/store.js";

export var maxDuration = 60;

export function GET(request) {
  var url = new URL(request.url);
  var section = url.searchParams.get("section") || "all";

  function doAll() {
    return researchTrends().then(function(trendData) {
      updateTrends(trendData);
      return new Promise(function(r) { setTimeout(r, 3000); }).then(function() {
        return generatePosts(trendData.trends || []);
      });
    }).then(function(postData) {
      updatePosts(postData.posts || []);
      return { ok: true, time: new Date().toISOString() };
    });
  }

  function doCompetitors() {
    return analyzeCompetitors().then(function(compData) {
      updateCompetitors(compData.competitors || []);
      return { ok: true, time: new Date().toISOString() };
    });
  }

  function doCalendar() {
    var platforms = ["X Twitter", "LinkedIn", "Telegram", "Instagram"];
    return generateCalendar(platforms).then(function(calData) {
      updateCalendar(calData.posts || []);
      return { ok: true, time: new Date().toISOString() };
    });
  }

  function doPosts() {
    var store = getStore();
    if (store.trends.length === 0) {
      return Promise.resolve({ ok: false, error: "No trends yet. Refresh All first." });
    }
    return generatePosts(store.trends).then(function(postData) {
      updatePosts(postData.posts || []);
      return { ok: true, time: new Date().toISOString() };
    });
  }

  var work;
  if (section === "competitors") work = doCompetitors();
  else if (section === "calendar") work = doCalendar();
  else if (section === "posts") work = doPosts();
  else work = doAll();

  return work.then(function(result) {
    return Response.json(result);
  }).catch(function(err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  });
}
