import { getBrandPrompt } from "./brand.js";
import { getHistoryContext } from "./store.js";

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

function callClaudeMulti(messages) {
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: messages
    })
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

function withRetry(prompt, useSearch, key) {
  return callClaude(prompt, useSearch).then(function(data) {
    if (data.error) throw new Error(data.error.message || "API error");
    var text = extractText(data.content);
    var parsed = parseJSON(text);
    if (parsed && parsed[key]) return parsed;
    return callClaudeMulti([
      { role: "user", content: prompt },
      { role: "assistant", content: data.content || [] },
      { role: "user", content: "Output ONLY raw JSON now." }
    ]).then(function(data2) {
      if (data2.error) throw new Error(data2.error.message || "API error");
      var text2 = extractText(data2.content);
      var parsed2 = parseJSON(text2);
      if (parsed2 && parsed2[key]) return parsed2;
      throw new Error("Could not parse " + key);
    });
  });
}

export function researchTrends() {
  var prompt = "Search web for top 5 crypto trends right now. Return ONLY JSON: {\"trends\":[{\"title\":\"x\",\"summary\":\"x\",\"hashtags\":[\"x\"],\"heat\":\"hot\",\"category\":\"x\",\"source\":\"x\"}],\"market_mood\":\"x\"}. heat: hot/warm/rising.";
  return withRetry(prompt, true, "trends");
}

export function generatePosts(trends) {
  var t = [];
  for (var i = 0; i < Math.min(trends.length, 3); i++) {
    t.push(trends[i].title);
  }
  var prompt = "Create social posts for XBO.com crypto exchange about: " + t.join(", ") + ". 2 posts per platform. Return ONLY JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}. Platforms: X Twitter (280 chars max), LinkedIn, Telegram, Instagram.";
  return withRetry(prompt, false, "posts");
}

export function analyzeCompetitors() {
  var prompt = "Search web for latest moves by Binance OKX Coinbase Bybit Kraken. Return ONLY JSON: {\"competitors\":[{\"name\":\"x\",\"recent_moves\":\"x\",\"content_style\":\"x\",\"opportunity\":\"x\"}]}. Focus on social media and marketing.";
  return withRetry(prompt, true, "competitors");
}

export function generateCalendar(platforms) {
  var prompt = "Create 6 social media posts for today for XBO.com crypto exchange. Mix platforms: X LinkedIn Telegram Instagram. Return ONLY JSON: {\"posts\":[{\"time\":\"9:00 AM\",\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"category\":\"trending\"}]}. Categories: trending/educational/product/engagement/community. Times in UTC+4.";
  return withRetry(prompt, true, "posts");
}

export function generateOnDemand(topic) {
  var prompt = "Search web about: " + topic + ". Create 4 posts for XBO.com (1 per platform: X Twitter 280chars, LinkedIn, Telegram, Instagram). Return ONLY JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}.";
  return withRetry(prompt, true, "posts");
}
