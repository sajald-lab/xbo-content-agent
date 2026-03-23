import { generateOnDemand } from "../../../lib/claude.js";
import { updatePosts } from "../../../lib/store.js";

export var maxDuration = 60;

export function POST(request) {
  return request.json().then(function(body) {
    var topic = body.topic || "";
    if (!topic) {
      return Response.json({ error: "No topic provided" }, { status: 400 });
    }
    return generateOnDemand(topic).then(function(data) {
      updatePosts(data.posts || []);
      return Response.json({ ok: true, posts: data.posts || [] });
    });
  }).catch(function(err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  });
}
