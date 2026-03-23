import { getBrandPrompt } from "./brand.js";
import { getSourcesPrompt } from "./sources.js";
import { getHistoryContext } from "./store.js";

var API_URL = "https://api.anthropic.com/v1/messages";
var MODEL = "claude-haiku-4-5-20251001";

function getKey() {
  return process.env.ANTHROPIC_API_KEY || "";
}

function callClaude(prompt, useSearch) {
  var body = {
    model: MODEL,
    max_tokens: 2048,
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
      max_tokens: 2048,
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
      { role: "user", content: "Now output ONLY the raw JSON object. Nothing else." }
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
  var prompt = "You are a crypto web3 fintech research analyst. " +
    getSourcesPrompt() +
    " Search the web for what is trending RIGHT NOW. " +
    "Look for breaking news, price movements, launches, partnerships, regulatory developments, viral moments. " +
    "Respond with ONLY raw JSON no markdown. " +
    "JSON must have trends array each with title string summary string hashtags array heat string (hot warm or rising) category string source string. Also market_mood string. Return 5 to 8 real trends.";
  return withRetry(prompt, true, "trends");
}

export function generatePosts(trends) {
  var trendText = [];
  for (var i = 0; i < trends.length; i++) {
    trendText.push(trends[i].title + ": " + trends[i].summary);
  }
  var prompt = getBrandPrompt() + ". " +
    "Based on these trending topics: " + trendText.join(" | ") + ". " +
    getHistoryContext() + " " +
    "Generate social media content for X Twitter LinkedIn Telegram Instagram. " +
    "X Twitter max 280 chars punchy with hashtags. LinkedIn professional 1-3 paragraphs with CTA. Telegram direct community-focused. Instagram caption hook first line. " +
    "Generate 2 posts per platform 8 total. Mix tones. " +
    "Respond ONLY raw JSON no markdown. JSON must have posts array each with platform string tone string content string hashtags array engagement_tip string.";
  return withRetry(prompt, false, "posts");
}

export function analyzeCompetitors() {
  var prompt = "You are a competitive intelligence analyst for XBO.com crypto exchange. " +
    "Search the web for LATEST social media posts campaigns product launches marketing moves from Binance OKX Coinbase Bybit Kraken Bitget. Focus on last 24-48 hours. " +
    getBrandPrompt() + " " +
    "For each identify what they posted their angle and how XBO.com could create counter-content. " +
    "Respond ONLY raw JSON no markdown. JSON must have competitors array each with name string recent_moves string content_style string opportunity string.";
  return withRetry(prompt, true, "competitors");
}

export function generateCalendar(platforms) {
  var prompt = getBrandPrompt() + ". " +
    getHistoryContext() + " " +
    "Create content plan for TODAY with 6-8 posts across the day. " +
    "Platforms: " + platforms.join(", ") + ". " +
    "Mix trending commentary educational product highlights engagement community. " +
    "Times for UTC+4 Dubai. Search web for current trends. " +
    "Respond ONLY raw JSON no markdown. JSON must have posts array each with time string platform string tone string content string category string (trending educational product engagement or community).";
  return withRetry(prompt, true, "posts");
}

export function generateOnDemand(topic) {
  var prompt = getBrandPrompt() + ". " +
    "Generate social media posts about: " + topic + ". " +
    "Search web for latest info on this topic. " +
    getHistoryContext() + " " +
    "Generate 1 post each for X Twitter (max 280 chars) LinkedIn Telegram Instagram. " +
    "Respond ONLY raw JSON no markdown. JSON must have posts array each with platform string tone string content string hashtags array engagement_tip string.";
  return withRetry(prompt, true, "posts");
}
