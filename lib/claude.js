var API_URL = "https://api.anthropic.com/v1/messages";
var MODEL = "claude-haiku-4-5-20251001";

function getKey() {
  return process.env.ANTHROPIC_API_KEY || "";
}

function callClaude(prompt, useSearch) {
  var body = {
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }]
  };
  if (useSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body)
  }).then(function(r) { return r.json(); });
}

function extractText(content) {
  var result = "";
  for (var i = 0; i < (content || []).length; i++) {
    if (content[i].type === "text" && content[i].text) {
      result += " " + content[i].text;
    }
  }
  return result.trim();
}

function parseJSON(text) {
  if (!text) return null;
  var cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch (e) { }
  var start = cleaned.indexOf("{");
  if (start < 0) return null;
  var depth = 0;
  var end = -1;
  for (var i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    if (cleaned[i] === "}") depth--;
    if (depth === 0) { end = i; break; }
  }
  if (end > start) {
    try { return JSON.parse(cleaned.substring(start, end + 1)); } catch (e) { }
  }
  return null;
}

function doCall(prompt, useSearch, key) {
  return callClaude(prompt, useSearch).then(function(data) {
    if (data.error) throw new Error(data.error.message || "API error");
    var text = extractText(data.content);
    var parsed = parseJSON(text);
    if (parsed && parsed[key]) return parsed;
    throw new Error("Could not parse " + key);
  });
}

export function researchTrends() {
  return doCall("Search crypto news today. Return 5 trends as JSON: {\"trends\":[{\"title\":\"x\",\"summary\":\"x\",\"hashtags\":[\"x\"],\"heat\":\"hot\",\"category\":\"x\",\"source\":\"x\"}],\"market_mood\":\"x\"}", true, "trends");
}

export function generatePosts(trends) {
  var t = [];
  for (var i = 0; i < Math.min(trends.length, 3); i++) {
    t.push(trends[i].title);
  }
  return doCall("Create 8 posts for XBO.com about: " + t.join(", ") + ". 2 per platform. JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}. X Twitter 280chars, LinkedIn, Telegram, Instagram.", false, "posts");
}

export function analyzeCompetitors() {
  return doCall("Search latest news from Binance Coinbase OKX. Return JSON: {\"competitors\":[{\"name\":\"x\",\"recent_moves\":\"x\",\"content_style\":\"x\",\"opportunity\":\"x\"}]}", true, "competitors");
}

export function generateCalendar(platforms) {
  return doCall("Create 6 posts for XBO.com crypto exchange for today. JSON: {\"posts\":[{\"time\":\"9:00 AM\",\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"category\":\"trending\"}]}. Mix X LinkedIn Telegram Instagram. Times UTC+4.", false, "posts");
}

export function generateOnDemand(topic) {
  return doCall("Search: " + topic + ". Create 4 posts for XBO.com (X Twitter 280chars, LinkedIn, Telegram, Instagram). JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}", true, "posts");
}
