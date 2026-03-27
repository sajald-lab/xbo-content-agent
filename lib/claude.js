var API_URL = "https://api.anthropic.com/v1/messages";
var MODEL = "claude-haiku-4-5-20251001";

function getKey() {
  return process.env.ANTHROPIC_API_KEY || "";
}

function callClaude(prompt, useSearch, systemPrompt) {
  var body = {
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }]
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }
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
  }).then(function (r) { return r.json(); });
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

function stripCitations(text) {
  if (!text) return text;
  return text
    .replace(/<\/?antml:cite[^>]*>/g, "")
    .replace(/<\/?cite[^>]*>/g, "")
    .replace(/<cite[^>]*>/g, "")
    .replace(/<\/cite>/g, "");
}

function cleanObject(obj) {
  if (!obj) return obj;
  if (typeof obj === "string") return stripCitations(obj);
  if (Array.isArray(obj)) return obj.map(cleanObject);
  if (typeof obj === "object") {
    var out = {};
    for (var k in obj) { out[k] = cleanObject(obj[k]); }
    return out;
  }
  return obj;
}

function parseJSON(text) {
  if (!text) return null;
  var cleaned = stripCitations(text)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Try direct parse first
  try {
    return cleanObject(JSON.parse(cleaned));
  } catch (e) { }

  // Try to find a JSON object {...}
  var objStart = cleaned.indexOf("{");
  if (objStart >= 0) {
    var depth = 0, objEnd = -1;
    for (var i = objStart; i < cleaned.length; i++) {
      if (cleaned[i] === "{") depth++;
      if (cleaned[i] === "}") depth--;
      if (depth === 0) { objEnd = i; break; }
    }
    if (objEnd > objStart) {
      try {
        return cleanObject(JSON.parse(cleaned.substring(objStart, objEnd + 1)));
      } catch (e) { }
    }
  }

  // Try to find a JSON array [...]
  var arrStart = cleaned.indexOf("[");
  if (arrStart >= 0) {
    var depth2 = 0, arrEnd = -1;
    for (var j = arrStart; j < cleaned.length; j++) {
      if (cleaned[j] === "[") depth2++;
      if (cleaned[j] === "]") depth2--;
      if (depth2 === 0) { arrEnd = j; break; }
    }
    if (arrEnd > arrStart) {
      try {
        return cleanObject(JSON.parse(cleaned.substring(arrStart, arrEnd + 1)));
      } catch (e) { }
    }
  }

  return null;
}

function doCall(prompt, useSearch, key, systemPrompt) {
  return callClaude(prompt, useSearch, systemPrompt).then(function (data) {
    if (data.error) throw new Error(data.error.message || "API error");
    var text = extractText(data.content);
    var parsed = parseJSON(text);

    // If parsed is already an array, wrap it in the expected key
    if (Array.isArray(parsed)) {
      var wrapper = {};
      wrapper[key] = parsed;
      return wrapper;
    }

    // If parsed is an object with the key, return it
    if (parsed && parsed[key]) return parsed;

    // If parsed is an object but missing the key, try to find an array value
    if (parsed && typeof parsed === "object") {
      var keys = Object.keys(parsed);
      for (var i = 0; i < keys.length; i++) {
        if (Array.isArray(parsed[keys[i]])) {
          var wrapper2 = {};
          wrapper2[key] = parsed[keys[i]];
          return wrapper2;
        }
      }
    }

    throw new Error("Could not parse " + key);
  });
}

// === EXISTING FUNCTIONS (unchanged behavior) ===

export function researchTrends() {
  return doCall(
    "Search crypto news today. Return 5 trends as JSON: {\"trends\":[{\"title\":\"x\",\"summary\":\"x\",\"hashtags\":[\"x\"],\"heat\":\"hot\",\"category\":\"x\",\"source\":\"x\"}],\"market_mood\":\"x\"}",
    true,
    "trends"
  );
}

export function generatePosts(trends, platforms) {
  var t = [];
  for (var i = 0; i < Math.min(trends.length, 3); i++) t.push(trends[i].title);
  var platStr = (platforms && platforms.length > 0) ? platforms.join(", ") : "X, LinkedIn, Telegram, Instagram";
  var rules = "Rules per platform: X max 280 chars with hook. LinkedIn professional with CTA. Telegram direct community tone. Instagram caption with hook and hashtags.";
  return doCall(
    "Create social posts for XBO.com crypto exchange about: " + t.join(", ") + ". Platforms: " + platStr + ". " + rules + " 2 posts per platform. Return ONLY JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}",
    false,
    "posts"
  );
}

export function analyzeCompetitors() {
  return doCall(
    "Search latest news from Binance Coinbase OKX. Return JSON: {\"competitors\":[{\"name\":\"x\",\"recent_moves\":\"x\",\"content_style\":\"x\",\"opportunity\":\"x\"}]}",
    true,
    "competitors"
  );
}

export function researchTopic(topic) {
  return doCall(
    "Search web about: " + topic + ". Return JSON: {\"findings\":[{\"title\":\"x\",\"summary\":\"x\",\"source\":\"x\",\"relevance\":\"x\"}]}",
    true,
    "findings"
  );
}

export function generateCalendar(platforms) {
  var platStr = (platforms && platforms.length > 0) ? platforms.join(", ") : "X, LinkedIn, Telegram, Instagram";
  return doCall(
    "Create 6 posts for XBO.com for today. Platforms: " + platStr + ". JSON: {\"posts\":[{\"time\":\"9:00 AM\",\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"category\":\"trending\"}]}. Categories: trending/educational/product/engagement/community. Times UTC+4.",
    false,
    "posts"
  );
}

// === UPDATED: Smart generate with system context + knowledge base ===

export function generateOnDemand(topic, platforms, systemContext) {
  var platStr = (platforms && platforms.length > 0) ? platforms.join(", ") : "X, LinkedIn, Telegram, Instagram";

  // Detect if the topic is already a full instruction (from templates or smart briefing)
  var isFullInstruction = /^(create|write|generate|draft|make)\b/i.test(topic.trim());

  var prompt;
  if (isFullInstruction) {
    // Topic is already a complete instruction — don't double-wrap
    prompt = topic +
      "\n\nReturn ONLY valid JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}" +
      "\nEach post must have platform, tone, content fields. No markdown, no extra text, just JSON.";
  } else {
    // Topic is a subject — wrap it in a generation prompt
    var rules = "Rules: X max 280 chars with hook. LinkedIn professional with CTA (no hashtags). Telegram direct with emojis. Instagram caption with hashtags.";
    prompt = "Search: " + topic +
      ". Create posts for XBO.com for platforms: " + platStr + ". " + rules +
      " 1 post per platform. Return ONLY valid JSON: {\"posts\":[{\"platform\":\"x\",\"tone\":\"x\",\"content\":\"x\",\"hashtags\":[\"x\"],\"engagement_tip\":\"x\"}]}" +
      "\nNo markdown, no extra text, just JSON.";
  }

  // Use system context (with knowledge base) if provided
  var sysPrompt = systemContext ||
    "You are a content generator for XBO.com, a regulated crypto exchange. Generate social media posts. Return ONLY valid JSON with no extra text.";

  return doCall(prompt, true, "posts", sysPrompt);
}
