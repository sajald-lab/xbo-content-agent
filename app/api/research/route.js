import { researchTopic } from "../../../lib/claude.js";

export var maxDuration = 60;

export function POST(request) {
  return request.json().then(function(body) {
    var topic = body.topic || "";
    if (!topic) return Response.json({ error: "No topic" }, { status: 400 });
    return researchTopic(topic).then(function(data) {
      return Response.json({ ok: true, findings: data.findings || [] });
    });
  }).catch(function(err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  });
}
