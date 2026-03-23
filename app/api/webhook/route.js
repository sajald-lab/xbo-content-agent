import { researchTrends, generateOnDemand, analyzeCompetitors, generateCalendar } from "../../../lib/claude.js";
import { sendMessage, formatTrendAlert, formatPostDrafts } from "../../../lib/telegram.js";
import { getStore } from "../../../lib/store.js";

export var maxDuration = 60;

export function POST(request) {
  return request.json().then(function(body) {
    var message = body.message;
    if (!message || !message.text) {
      return Response.json({ ok: true });
    }

    var text = message.text.trim();
    var chatId = message.chat.id;

    if (text === "/help" || text === "/start") {
      var helpMsg = "<b>XBO Content Agent Commands</b>\n\n";
      helpMsg += "/trends - Show latest trending topics\n";
      helpMsg += "/post [topic] - Generate posts about a topic\n";
      helpMsg += "/competitors - Latest competitor intel\n";
      helpMsg += "/calendar - Todays content plan\n";
      helpMsg += "/status - Check agent status\n";
      helpMsg += "/help - Show this message";
      return sendMessage(helpMsg, chatId).then(function() {
        return Response.json({ ok: true });
      });
    }

    if (text === "/trends") {
      return sendMessage("Researching trends...", chatId).then(function() {
        return researchTrends();
      }).then(function(data) {
        var msg = "<b>LATEST TRENDS</b>\n\n";
        msg += "Market mood: " + (data.market_mood || "N/A") + "\n\n";
        var trends = data.trends || [];
        for (var i = 0; i < trends.length; i++) {
          msg += formatTrendAlert(trends[i]) + "\n\n";
        }
        return sendMessage(msg, chatId);
      }).then(function() {
        return Response.json({ ok: true });
      });
    }

    if (text.indexOf("/post ") === 0) {
      var topic = text.substring(6).trim();
      if (!topic) {
        return sendMessage("Usage: /post [topic]", chatId).then(function() {
          return Response.json({ ok: true });
        });
      }
      return sendMessage("Generating posts about: " + topic + "...", chatId).then(function() {
        return generateOnDemand(topic);
      }).then(function(data) {
        return sendMessage(formatPostDrafts(data.posts || []), chatId);
      }).then(function() {
        return Response.json({ ok: true });
      });
    }

    if (text === "/status") {
      var store = getStore();
      var msg = "<b>Agent Status</b>\n\n";
      msg += "Last update: " + (store.lastUpdate || "Not yet") + "\n";
      msg += "Trends tracked: " + store.trends.length + "\n";
      msg += "Posts generated: " + store.history.length + " total";
      return sendMessage(msg, chatId).then(function() {
        return Response.json({ ok: true });
      });
    }

    return Response.json({ ok: true });
  }).catch(function(err) {
    console.error("[WEBHOOK] Error:", err.message);
    return Response.json({ ok: true });
  });
}
