function getToken() {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

function getChatId() {
  return process.env.TELEGRAM_CHAT_ID || "";
}

function esc(s) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sendMessage(text, chatId) {
  var id = chatId || getChatId();
  var url = "https://api.telegram.org/bot" + getToken() + "/sendMessage";
  var chunks = [];
  var remaining = text;
  while (remaining.length > 0) {
    chunks.push(remaining.substring(0, 4000));
    remaining = remaining.substring(4000);
  }
  var chain = Promise.resolve();
  for (var i = 0; i < chunks.length; i++) {
    (function(chunk) {
      chain = chain.then(function() {
        return fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: id,
            text: chunk,
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        });
      });
    })(chunks[i]);
  }
  return chain;
}

export function formatTrendAlert(trend) {
  var heatLabel = (trend.heat || "warm").toUpperCase();
  var msg = "";
  msg += "<b>TRENDING: " + esc(trend.title) + "</b>\n";
  msg += "Heat: " + heatLabel + " | " + esc(trend.category || "") + "\n";
  if (trend.source) msg += "Source: " + esc(trend.source) + "\n";
  msg += "\n" + esc(trend.summary) + "\n";
  if (trend.hashtags && trend.hashtags.length > 0) {
    msg += "\n" + trend.hashtags.map(function(h) { return "#" + h; }).join(" ");
  }
  return msg;
}

export function formatPostDrafts(posts) {
  var msg = "<b>READY-TO-POST DRAFTS</b>\n---\n\n";
  var platforms = ["x", "linkedin", "telegram", "instagram"];
  var labels = { x: "X (TWITTER)", linkedin: "LINKEDIN", telegram: "TELEGRAM", instagram: "INSTAGRAM" };
  for (var pi = 0; pi < platforms.length; pi++) {
    var plat = platforms[pi];
    var platPosts = [];
    for (var i = 0; i < posts.length; i++) {
      if ((posts[i].platform || "").toLowerCase().indexOf(plat) >= 0) {
        platPosts.push(posts[i]);
      }
    }
    if (platPosts.length === 0) continue;
    msg += "<b>" + (labels[plat] || plat.toUpperCase()) + ":</b>\n";
    for (var j = 0; j < platPosts.length; j++) {
      msg += "<code>" + esc(platPosts[j].content) + "</code>\n\n";
    }
  }
  return msg;
}
