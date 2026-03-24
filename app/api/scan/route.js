import { researchTrends, generatePosts, analyzeCompetitors, generateCalendar } from "../../../lib/claude.js";
import { updateTrends, updatePosts, updateCompetitors, updateCalendar, getStore } from "../../../lib/store.js";

export var maxDuration = 60;

export function GET(request) {
  var url = new URL(request.url);
  var section = url.searchParams.get("section") || "all";
  var platforms = url.searchParams.get("platforms");
  var platArr = platforms ? platforms.split(",") : null;

  if (section === "competitors") {
    return analyzeCompetitors().then(function(d) { updateCompetitors(d.competitors || []); return Response.json({ ok: true }); })
    .catch(function(e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); });
  }
  if (section === "calendar") {
    return generateCalendar(platArr).then(function(d) { updateCalendar(d.posts || []); return Response.json({ ok: true }); })
    .catch(function(e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); });
  }
  if (section === "posts") {
    var store = getStore();
    if (store.trends.length === 0) return Promise.resolve(Response.json({ ok: false, error: "No trends yet." }));
    return generatePosts(store.trends, platArr).then(function(d) { updatePosts(d.posts || []); return Response.json({ ok: true }); })
    .catch(function(e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); });
  }
  return researchTrends().then(function(td) {
    updateTrends(td);
    return new Promise(function(r) { setTimeout(r, 3000); }).then(function() { return generatePosts(td.trends || [], platArr); });
  }).then(function(pd) {
    updatePosts(pd.posts || []);
    return Response.json({ ok: true });
  }).catch(function(e) { return Response.json({ ok: false, error: e.message }, { status: 500 }); });
}
