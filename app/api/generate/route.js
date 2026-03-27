import { generateOnDemand } from "../../../lib/claude.js";
import { updatePosts } from "../../../lib/store.js";

export var maxDuration = 60;

export function POST(request) {
  return request.json().then(function (body) {
    var topic = body.topic || "";
    var platforms = body.platforms || null;
    var systemContext = body.systemContext || null;

    if (!topic) {
      return Response.json({ error: "No topic" }, { status: 400 });
    }

    return generateOnDemand(topic, platforms, systemContext).then(function (data) {
      updatePosts(data.posts || []);
      return Response.json({ ok: true, posts: data.posts || [] });
    });
  }).catch(function (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  });
}
