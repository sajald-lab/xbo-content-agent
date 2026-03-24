"use client";
import { useState, useEffect } from "react";

var PILLARS = ["Market Commentary", "Product Education", "Community/Memes", "Regulation", "LATAM/Football"];
var PLATFORMS = ["X Twitter", "LinkedIn", "Telegram", "Instagram"];
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Dashboard() {
  var s = {};
  s.tab = useState("briefing");
  s.data = useState(null);
  s.loading = useState(false);
  s.loadWhat = useState("");
  s.err = useState(null);
  s.copied = useState({});
  s.genPosts = useState(null);
  s.genLoading = useState(false);
  s.searchQuery = useState("");
  s.savedPosts = useState([]);
  s.calendarPosts = useState({});
  s.postedLog = useState([]);
  s.editingIdx = useState(null);
  s.editText = useState("");
  s.replyInput = useState("");
  s.replyResult = useState(null);
  s.replyLoading = useState(false);

  var tab = s.tab[0], setTab = s.tab[1];
  var data = s.data[0], setData = s.data[1];
  var loading = s.loading[0], setLoading = s.loading[1];
  var loadWhat = s.loadWhat[0], setLoadWhat = s.loadWhat[1];
  var err = s.err[0], setErr = s.err[1];
  var copied = s.copied[0], setCopied = s.copied[1];
  var genPosts = s.genPosts[0], setGenPosts = s.genPosts[1];
  var genLoading = s.genLoading[0], setGenLoading = s.genLoading[1];
  var searchQuery = s.searchQuery[0], setSearchQuery = s.searchQuery[1];
  var savedPosts = s.savedPosts[0], setSavedPosts = s.savedPosts[1];
  var calendarPosts = s.calendarPosts[0], setCalendarPosts = s.calendarPosts[1];
  var postedLog = s.postedLog[0], setPostedLog = s.postedLog[1];
  var editingIdx = s.editingIdx[0], setEditingIdx = s.editingIdx[1];
  var editText = s.editText[0], setEditText = s.editText[1];
  var replyInput = s.replyInput[0], setReplyInput = s.replyInput[1];
  var replyResult = s.replyResult[0], setReplyResult = s.replyResult[1];
  var replyLoading = s.replyLoading[0], setReplyLoading = s.replyLoading[1];

  useEffect(function() { fetchData(); }, []);

  function fetchData() {
    fetch("/api/data").then(function(r) { return r.json(); }).then(function(d) { setData(d); }).catch(function() {});
  }

  function doRefresh(section) {
    setLoading(true); setLoadWhat(section); setErr(null);
    fetch("/api/scan?section=" + section).then(function(r) { return r.json(); }).then(function(d) {
      if (d.error) { setErr(d.error); } else { fetchData(); }
      setLoading(false);
    }).catch(function() { setErr("Scan failed"); setLoading(false); });
  }

  function doSearch() {
    if (!searchQuery.trim()) return;
    setGenLoading(true); setGenPosts(null); setErr(null);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: searchQuery })
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGenPosts(d.posts); setTab("drafts"); fetchData(); }
      else if (d.error) { setErr(d.error); }
      setGenLoading(false);
    }).catch(function() { setErr("Search failed"); setGenLoading(false); });
  }

  function doGenerateForTrend(trend) {
    setGenLoading(true); setGenPosts(null);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: trend.title + " - " + trend.summary })
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGenPosts(d.posts); setTab("drafts"); fetchData(); }
      else if (d.error) { setErr(d.error); }
      setGenLoading(false);
    }).catch(function() { setErr("Generation failed"); setGenLoading(false); });
  }

  function doRetone(post, tone) {
    setGenLoading(true);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Rewrite this post in a " + tone + " tone for " + post.platform + ": " + post.content })
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts && d.posts.length > 0) {
        var updated = (genPosts || (data && data.posts) || []).slice();
        var idx = updated.indexOf(post);
        if (idx >= 0) { updated[idx] = d.posts[0]; setGenPosts(updated); }
      }
      setGenLoading(false);
    }).catch(function() { setGenLoading(false); });
  }

  function doReplyGenerate() {
    if (!replyInput.trim()) return;
    setReplyLoading(true); setReplyResult(null);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Write a smart engaging reply from XBO.com perspective to this post: " + replyInput })
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setReplyResult(d.posts); }
      else if (d.error) { setErr(d.error); }
      setReplyLoading(false);
    }).catch(function() { setReplyLoading(false); });
  }

  function savePost(post, pillar) {
    var newPost = Object.assign({}, post, { pillar: pillar || "Market Commentary", savedAt: new Date().toLocaleString() });
    setSavedPosts(function(prev) { return prev.concat([newPost]); });
  }

  function addToCalendar(post, day) {
    setCalendarPosts(function(prev) {
      var updated = Object.assign({}, prev);
      var list = (updated[day] || []).slice();
      list.push(Object.assign({}, post, { scheduledDay: day }));
      updated[day] = list;
      return updated;
    });
  }

  function markAsPosted(post) {
    setPostedLog(function(prev) {
      return prev.concat([Object.assign({}, post, { postedAt: new Date().toLocaleString() })]);
    });
  }

  function copyText(text, idx) {
    navigator.clipboard.writeText(text).then(function() {
      var o = {}; o[idx] = true;
      setCopied(function(p) { return Object.assign({}, p, o); });
      setTimeout(function() { var o2 = {}; o2[idx] = false; setCopied(function(p) { return Object.assign({}, p, o2); }); }, 2000);
    });
  }

  function heatColor(h) {
    if (h === "hot") return { bg: "#fee2e2", color: "#dc2626", label: "HOT" };
    if (h === "rising") return { bg: "#fef9c3", color: "#ca8a04", label: "RISING" };
    return { bg: "#ffedd5", color: "#ea580c", label: "WARM" };
  }

  function platColor(p) {
    var k = (p || "").toLowerCase();
    if (k.indexOf("twitter") >= 0 || k.indexOf("x ") >= 0 || k === "x") return { border: "#1d9bf0", bg: "#f0f9ff", icon: "X", label: "X / Twitter" };
    if (k.indexOf("linkedin") >= 0) return { border: "#0a66c2", bg: "#f0f4ff", icon: "in", label: "LinkedIn" };
    if (k.indexOf("telegram") >= 0) return { border: "#229ed9", bg: "#f0faff", icon: "TG", label: "Telegram" };
    return { border: "#e1306c", bg: "#fdf2f8", icon: "IG", label: "Instagram" };
  }

  function pillarColor(p) {
    var colors = { "Market Commentary": "#2563eb", "Product Education": "#16a34a", "Community/Memes": "#d97706", "Regulation": "#dc2626", "LATAM/Football": "#7c3aed" };
    return colors[p] || "#64748b";
  }

  // Styles
  var page = { minHeight: "100vh", background: "#f8f9fb" };
  var hdr = { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 };
  var logo = { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #0052ff, #00c6ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff" };
  var ct = { maxWidth: 980, margin: "0 auto", padding: "24px 20px" };
  var card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 12 };
  var btnB = { padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: "#0052ff", border: "none", cursor: "pointer" };
  var btnG = { padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "#64748b", background: "#fff", border: "1px solid #e5e7eb", cursor: "pointer" };
  var btnSm = { padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid #e5e7eb", background: "#fff", color: "#64748b" };

  var TABS = [
    { id: "briefing", label: "Briefing" },
    { id: "drafts", label: "Drafts" },
    { id: "saved", label: "Saved" },
    { id: "calendar", label: "Calendar" },
    { id: "competitors", label: "Competitors" },
    { id: "replies", label: "Replies" },
    { id: "tracker", label: "Tracker" }
  ];

  var header = (
    <div style={hdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={logo}>X</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>XBO.com Content Agent</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: data && data.lastUpdate ? "#22c55e" : "#94a3b8", marginRight: 5, verticalAlign: "middle" }}></span>
            {data && data.lastUpdate ? "Updated " + new Date(data.lastUpdate).toLocaleTimeString() : "Not scanned yet"}
          </div>
        </div>
      </div>
      <button disabled={loading} onClick={function() { doRefresh("all"); }} style={Object.assign({}, btnB, loading ? { opacity: 0.5 } : {})}>
        {loading && loadWhat === "all" ? "Scanning..." : "Refresh All"}
      </button>
    </div>
  );

  var tabBar = (
    <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", overflowX: "auto" }}>
      {TABS.map(function(t) {
        var active = tab === t.id;
        return (
          <div key={t.id} onClick={function() { setTab(t.id); }} style={{
            padding: "12px 16px", fontSize: 13, fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
            color: active ? "#0052ff" : "#64748b",
            borderBottom: active ? "2px solid #0052ff" : "2px solid transparent", cursor: "pointer"
          }}>{t.label}{t.id === "saved" && savedPosts.length > 0 ? " (" + savedPosts.length + ")" : ""}</div>
        );
      })}
    </div>
  );

  var errBox = err ? <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, fontSize: 13, color: "#dc2626", margin: "16px 0" }}>{err}</div> : null;

  // Search bar component
  var searchBar = (
    <div style={Object.assign({}, card, { display: "flex", gap: 8, alignItems: "center", padding: 14 })}>
      <input value={searchQuery} onChange={function(e) { setSearchQuery(e.target.value); }}
        onKeyDown={function(e) { if (e.key === "Enter") doSearch(); }}
        placeholder="Search any topic... (e.g. Bitcoin ETF, Solana memecoins, Argentina crypto)"
        style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#0f172a", outline: "none" }} />
      <button disabled={genLoading} onClick={doSearch} style={Object.assign({}, btnB, { whiteSpace: "nowrap" }, genLoading ? { opacity: 0.5 } : {})}>
        {genLoading ? "Searching..." : "Search + Generate"}
      </button>
    </div>
  );

  // Post card with editing, saving, pillar tagging
  function renderPostCard(post, i, prefix) {
    var idx = prefix + "-" + i;
    var isCp = copied[idx] === true;
    var isEditing = editingIdx === idx;
    var pc = platColor(post.platform);

    return (
      <div key={idx} style={{ background: "#fff", borderLeft: "3px solid " + pc.border, borderRadius: "0 10px 10px 0", border: "1px solid #e5e7eb", borderLeftColor: pc.border, borderLeftWidth: 3, padding: 16, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>{post.tone}</span>
            <span style={{ fontSize: 10, color: pc.border, fontWeight: 600 }}>{pc.label}</span>
            {post.pillar ? <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: pillarColor(post.pillar) + "15", color: pillarColor(post.pillar), fontWeight: 600 }}>{post.pillar}</span> : null}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={function() { copyText(isEditing ? editText : post.content, idx); }}
              style={Object.assign({}, btnSm, isCp ? { background: "#059669", color: "#fff", borderColor: "#059669" } : {})}>
              {isCp ? "Copied!" : "Copy"}
            </button>
            <button onClick={function() { if (isEditing) { post.content = editText; setEditingIdx(null); } else { setEditingIdx(idx); setEditText(post.content); } }}
              style={btnSm}>{isEditing ? "Save Edit" : "Edit"}</button>
          </div>
        </div>

        {isEditing ? (
          <textarea value={editText} onChange={function(e) { setEditText(e.target.value); }}
            style={{ width: "100%", border: "1px solid #bfdbfe", borderRadius: 8, padding: 10, fontSize: 13, color: "#1e293b", lineHeight: 1.6, minHeight: 80, fontFamily: "inherit", resize: "vertical" }} />
        ) : (
          <div style={{ fontSize: 14, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{post.content}</div>
        )}

        {(post.hashtags || []).length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {post.hashtags.map(function(h, j) { return <span key={j} style={{ fontSize: 11, color: "#0052ff", background: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>#{h}</span>; })}
          </div>
        ) : null}

        {post.engagement_tip ? (
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, fontStyle: "italic", background: "#f8fafc", padding: "6px 10px", borderRadius: 6 }}>Tip: {post.engagement_tip}</div>
        ) : null}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={function() { doRetone(post, "professional"); }} style={btnSm} disabled={genLoading}>Professional</button>
          <button onClick={function() { doRetone(post, "casual and funny"); }} style={btnSm} disabled={genLoading}>Casual</button>
          <button onClick={function() { doRetone(post, "bold hot take"); }} style={btnSm} disabled={genLoading}>Spicy</button>
          <span style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }}></span>
          {PILLARS.map(function(p) {
            return <button key={p} onClick={function() { savePost(post, p); }} style={Object.assign({}, btnSm, { color: pillarColor(p), borderColor: pillarColor(p) + "40" })}>{p}</button>;
          })}
          <span style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }}></span>
          {DAYS.slice(0, 5).map(function(d) {
            return <button key={d} onClick={function() { addToCalendar(post, d); }} style={Object.assign({}, btnSm, { fontSize: 9 })}>{d.substring(0, 3)}</button>;
          })}
        </div>
      </div>
    );
  }

  // ===== BRIEFING =====
  if (tab === "briefing") {
    var trends = data && data.trends ? data.trends : [];
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          {searchBar}
          {data && data.lastUpdate ? (
            <div style={{ background: "linear-gradient(135deg, #0052ff, #00c6ff)", borderRadius: 14, padding: "20px 24px", marginBottom: 20, color: "#fff" }}>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, marginBottom: 4 }}>MARKET MOOD</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{data.market_mood || "Analyzing..."}</div>
            </div>
          ) : (
            <div style={Object.assign({}, card, { padding: 40, textAlign: "center" })}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Welcome to your Content Command Center</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Click Refresh All to scan crypto trends, or search any topic above.</div>
              <button disabled={loading} onClick={function() { doRefresh("all"); }} style={btnB}>{loading ? "Scanning..." : "Run First Scan"}</button>
            </div>
          )}
          {errBox}
          {trends.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>Trending Now ({trends.length})</div>
              {trends.map(function(t, i) {
                var hc = heatColor(t.heat);
                return (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: hc.bg, color: hc.color }}>{hc.label}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{t.category}</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{t.title}</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{t.summary}</div>
                      </div>
                      <button disabled={genLoading} onClick={function() { doGenerateForTrend(t); }}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#0052ff", background: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer", whiteSpace: "nowrap" }}>
                        {genLoading ? "..." : "Generate Posts"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== DRAFTS =====
  if (tab === "drafts") {
    var allPosts = genPosts || (data && data.posts) || [];
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          {searchBar}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Drafts ({allPosts.length})</div>
            <button disabled={loading} onClick={function() { doRefresh("posts"); }} style={btnG}>Regenerate</button>
          </div>
          {errBox}
          {allPosts.length === 0 ? <div style={Object.assign({}, card, { textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 30 })}>No drafts yet. Search a topic or refresh trends.</div> : null}
          {allPosts.map(function(post, i) { return renderPostCard(post, i, "draft"); })}
        </div>
      </div>
    );
  }

  // ===== SAVED LIBRARY =====
  if (tab === "saved") {
    var grouped = {};
    for (var i = 0; i < savedPosts.length; i++) {
      var p = savedPosts[i].pillar || "Uncategorized";
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(savedPosts[i]);
    }
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Saved Posts ({savedPosts.length})</div>
            {savedPosts.length > 0 ? <button onClick={function() { setSavedPosts([]); }} style={btnG}>Clear All</button> : null}
          </div>
          {savedPosts.length === 0 ? <div style={Object.assign({}, card, { textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 30 })}>No saved posts yet. Save posts from Drafts using the content pillar buttons.</div> : null}
          {PILLARS.map(function(pillar) {
            var posts = grouped[pillar] || [];
            if (posts.length === 0) return null;
            return (
              <div key={pillar} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: pillarColor(pillar) }}></span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{pillar} ({posts.length})</span>
                </div>
                {posts.map(function(post, j) { return renderPostCard(post, j, "saved-" + pillar); })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== CALENDAR =====
  if (tab === "calendar") {
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Weekly Content Calendar</div>
            <button disabled={loading} onClick={function() { doRefresh("calendar"); }} style={btnG}>
              {loading && loadWhat === "calendar" ? "Planning..." : "Auto-Generate Week"}
            </button>
          </div>
          {errBox}
          {DAYS.map(function(day) {
            var posts = calendarPosts[day] || [];
            var aiPosts = (data && data.calendar || []).filter(function(p) { return (p.scheduledDay || "") === day; });
            var all = posts.concat(aiPosts);
            return (
              <div key={day} style={Object.assign({}, card, { padding: 14 })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: all.length > 0 ? 10 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{day}</div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{all.length} post{all.length !== 1 ? "s" : ""}</span>
                </div>
                {all.map(function(post, j) {
                  var pc = platColor(post.platform);
                  return (
                    <div key={j} style={{ background: "#f8fafc", borderRadius: 8, padding: 10, marginBottom: 6, borderLeft: "3px solid " + pc.border }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: pc.border }}>{pc.label}</span>
                          {post.time ? <span style={{ fontSize: 10, color: "#94a3b8" }}>{post.time}</span> : null}
                          {post.pillar ? <span style={{ fontSize: 9, color: pillarColor(post.pillar), fontWeight: 600 }}>{post.pillar}</span> : null}
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={function() { copyText(post.content, "cal-" + day + "-" + j); }}
                            style={Object.assign({}, btnSm, copied["cal-" + day + "-" + j] ? { background: "#059669", color: "#fff" } : {})}>
                            {copied["cal-" + day + "-" + j] ? "Copied!" : "Copy"}
                          </button>
                          <button onClick={function() { markAsPosted(post); }} style={Object.assign({}, btnSm, { color: "#16a34a", borderColor: "#bbf7d0" })}>Posted</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.5 }}>{post.content}</div>
                    </div>
                  );
                })}
                {all.length === 0 ? <div style={{ fontSize: 12, color: "#cbd5e1", fontStyle: "italic" }}>Drag posts here from Drafts or Saved</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== COMPETITORS =====
  if (tab === "competitors") {
    var comps = (data && data.competitors) || [];
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Competitor Intelligence</div>
            <button disabled={loading} onClick={function() { doRefresh("competitors"); }} style={btnG}>
              {loading && loadWhat === "competitors" ? "Analyzing..." : "Refresh"}
            </button>
          </div>
          {errBox}
          {comps.length === 0 ? <div style={Object.assign({}, card, { textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 30 })}>Click Refresh to analyze competitors.</div> : null}
          {comps.map(function(c, i) {
            return (
              <div key={i} style={card}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>{c.name}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 2 }}>RECENT MOVES</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{c.recent_moves}</div>
                </div>
                <div style={{ background: "#eff6ff", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0052ff", marginBottom: 2 }}>OPPORTUNITY FOR XBO</div>
                  <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>{c.opportunity}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== ENGAGEMENT REPLIES =====
  if (tab === "replies") {
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>Engagement Reply Generator</div>
          <div style={Object.assign({}, card, { padding: 16 })}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Paste a tweet, post, or topic and generate a smart reply from XBO.com's perspective.</div>
            <textarea value={replyInput} onChange={function(e) { setReplyInput(e.target.value); }}
              placeholder="Paste the tweet or describe the conversation you want to reply to..."
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, fontSize: 13, minHeight: 80, fontFamily: "inherit", resize: "vertical", marginBottom: 10 }} />
            <button disabled={replyLoading} onClick={doReplyGenerate} style={Object.assign({}, btnB, replyLoading ? { opacity: 0.5 } : {})}>
              {replyLoading ? "Generating..." : "Generate Reply"}
            </button>
          </div>
          {errBox}
          {replyResult ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "16px 0 8px" }}>Suggested Replies</div>
              {replyResult.map(function(r, i) { return renderPostCard(r, i, "reply"); })}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ===== PERFORMANCE TRACKER =====
  if (tab === "tracker") {
    var byPlatform = {};
    var byPillar = {};
    for (var i = 0; i < postedLog.length; i++) {
      var p = postedLog[i].platform || "Unknown";
      var pl = postedLog[i].pillar || "Untagged";
      byPlatform[p] = (byPlatform[p] || 0) + 1;
      byPillar[pl] = (byPillar[pl] || 0) + 1;
    }
    return (
      <div style={page}>{header}{tabBar}
        <div style={ct}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Performance Tracker</div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={Object.assign({}, card, { flex: 1, minWidth: 140, textAlign: "center" })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0052ff" }}>{postedLog.length}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Posts Published</div>
            </div>
            <div style={Object.assign({}, card, { flex: 1, minWidth: 140, textAlign: "center" })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{savedPosts.length}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Posts Saved</div>
            </div>
            <div style={Object.assign({}, card, { flex: 1, minWidth: 140, textAlign: "center" })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#d97706" }}>{Object.keys(byPlatform).length}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Platforms Active</div>
            </div>
          </div>

          {/* By Platform */}
          {Object.keys(byPlatform).length > 0 ? (
            <div style={Object.assign({}, card, { marginBottom: 16 })}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>Posts by Platform</div>
              {Object.keys(byPlatform).map(function(p) {
                var pc = platColor(p);
                var pct = Math.round((byPlatform[p] / postedLog.length) * 100);
                return (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", minWidth: 80 }}>{p}</span>
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 20 }}>
                      <div style={{ width: pct + "%", background: pc.border, borderRadius: 4, height: 20, minWidth: 20 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: "#64748b", minWidth: 30 }}>{byPlatform[p]}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* By Pillar */}
          {Object.keys(byPillar).length > 0 ? (
            <div style={Object.assign({}, card, { marginBottom: 16 })}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>Posts by Content Pillar</div>
              {Object.keys(byPillar).map(function(p) {
                var pct = Math.round((byPillar[p] / postedLog.length) * 100);
                return (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", minWidth: 120 }}>{p}</span>
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 20 }}>
                      <div style={{ width: pct + "%", background: pillarColor(p), borderRadius: 4, height: 20, minWidth: 20 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: "#64748b", minWidth: 30 }}>{byPillar[p]}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Posted Log */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>Recent Activity</div>
          {postedLog.length === 0 ? <div style={Object.assign({}, card, { textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 30 })}>No posts tracked yet. Mark posts as "Posted" from the Calendar tab.</div> : null}
          {postedLog.slice().reverse().slice(0, 20).map(function(p, i) {
            var pc = platColor(p.platform);
            return (
              <div key={i} style={Object.assign({}, card, { padding: 12, display: "flex", gap: 10, alignItems: "start" })}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: pc.bg, border: "1px solid " + pc.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: pc.border, flexShrink: 0 }}>{pc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.4 }}>{p.content && p.content.length > 100 ? p.content.substring(0, 100) + "..." : p.content}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{p.postedAt}{p.pillar ? " | " + p.pillar : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div style={page}>{header}{tabBar}</div>;
}  function doGenerateForTrend(trend) {
    setGenLoading(true);
    setGenPosts(null);
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: trend.title + " - " + trend.summary })
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGenPosts(d.posts); setTab("drafts"); fetchData(); }
      else if (d.error) { setErr(d.error); }
      setGenLoading(false);
    }).catch(function() { setErr("Generation failed"); setGenLoading(false); });
  }

  function copyText(text, idx) {
    navigator.clipboard.writeText(text).then(function() {
      var o = {}; o[idx] = true;
      setCopied(function(p) { return Object.assign({}, p, o); });
      setTimeout(function() { var o2 = {}; o2[idx] = false; setCopied(function(p) { return Object.assign({}, p, o2); }); }, 2000);
    });
  }

  function heatColor(h) {
    if (h === "hot") return { bg: "#fee2e2", color: "#dc2626", label: "HOT" };
    if (h === "rising") return { bg: "#fef9c3", color: "#ca8a04", label: "RISING" };
    return { bg: "#ffedd5", color: "#ea580c", label: "WARM" };
  }

  function platColor(p) {
    var k = (p || "").toLowerCase();
    if (k.indexOf("twitter") >= 0 || k.indexOf("x ") >= 0 || k === "x") return { border: "#1d9bf0", bg: "#f0f9ff", icon: "X", label: "X / Twitter" };
    if (k.indexOf("linkedin") >= 0) return { border: "#0a66c2", bg: "#f0f4ff", icon: "in", label: "LinkedIn" };
    if (k.indexOf("telegram") >= 0) return { border: "#229ed9", bg: "#f0faff", icon: "TG", label: "Telegram" };
    return { border: "#e1306c", bg: "#fdf2f8", icon: "IG", label: "Instagram" };
  }

  var headerStyle = { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 };
  var logoStyle = { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #0052ff, #00c6ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff" };
  var ctStyle = { maxWidth: 980, margin: "0 auto", padding: "24px 20px" };
  var cardStyle = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 12 };
  var btnBlue = { padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: "#0052ff", border: "none", cursor: "pointer" };
  var btnGhost = { padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "#64748b", background: "#fff", border: "1px solid #e5e7eb", cursor: "pointer" };

  var header = (
    <div style={headerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={logoStyle}>X</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>XBO.com Content Agent</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: data && data.lastUpdate ? "#22c55e" : "#94a3b8", marginRight: 5, verticalAlign: "middle" }}></span>
            {data && data.lastUpdate ? "Updated " + new Date(data.lastUpdate).toLocaleTimeString() : "Not scanned yet"}
          </div>
        </div>
      </div>
      <button disabled={loading} onClick={function() { doRefresh("all"); }} style={Object.assign({}, btnBlue, loading ? { opacity: 0.5, cursor: "not-allowed" } : {})}>
        {loading && loadWhat === "all" ? "Scanning..." : "Refresh All"}
      </button>
    </div>
  );

  var tabBar = (
    <div style={{ display: "flex", gap: 2, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
      {TABS.map(function(t) {
        var active = tab === t.id;
        return (
          <div key={t.id} onClick={function() { setTab(t.id); }} style={{
            padding: "12px 20px", fontSize: 13, fontWeight: active ? 600 : 500,
            color: active ? "#0052ff" : "#64748b",
            borderBottom: active ? "2px solid #0052ff" : "2px solid transparent",
            cursor: "pointer"
          }}>{t.label}</div>
        );
      })}
    </div>
  );

  var errBox = err ? (
    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, fontSize: 13, color: "#dc2626", margin: "16px 0" }}>{err}</div>
  ) : null;

  // ===== BRIEFING =====
  if (tab === "briefing") {
    var trends = data && data.trends ? data.trends : [];
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
        {header}{tabBar}
        <div style={ctStyle}>
          {data && data.lastUpdate ? (
            <div style={{ background: "linear-gradient(135deg, #0052ff, #00c6ff)", borderRadius: 14, padding: "20px 24px", marginBottom: 24, color: "#fff" }}>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, marginBottom: 4 }}>MARKET MOOD</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{data.market_mood || "Analyzing..."}</div>
            </div>
          ) : (
            <div style={Object.assign({}, cardStyle, { padding: 40, textAlign: "center" })}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Welcome to your Content Command Center</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Click Refresh All to scan crypto news, trends, and competitor activity.</div>
              <button disabled={loading} onClick={function() { doRefresh("all"); }} style={btnBlue}>
                {loading ? "Scanning..." : "Run First Scan"}
              </button>
            </div>
          )}
          {errBox}
          {trends.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>Trending Now ({trends.length})</div>
              {trends.map(function(t, i) {
                var hc = heatColor(t.heat);
                var tags = t.hashtags || [];
                return (
                  <div key={i} style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: hc.bg, color: hc.color }}>{hc.label}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{t.category}</span>
                          {t.source ? <span style={{ fontSize: 10, color: "#cbd5e1" }}>via {t.source}</span> : null}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{t.title}</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{t.summary}</div>
                        {tags.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                            {tags.map(function(h, j) { return <span key={j} style={{ fontSize: 11, color: "#0052ff", background: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>#{h}</span>; })}
                          </div>
                        ) : null}
                      </div>
                      <button disabled={genLoading} onClick={function() { doGenerateForTrend(t); }} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#0052ff", background: "#eff6ff", border: "1px solid #bfdbfe", cursor: genLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                        {genLoading ? "..." : "Generate Posts"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== DRAFTS =====
  if (tab === "drafts") {
    var allPosts = genPosts || (data && data.posts) || [];
    var platforms = ["x", "linkedin", "telegram", "instagram"];
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
        {header}{tabBar}
        <div style={ctStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Content Drafts ({allPosts.length})</div>
            <button disabled={loading} onClick={function() { doRefresh("posts"); }} style={btnGhost}>
              {loading && loadWhat === "posts" ? "Generating..." : "Regenerate All"}
            </button>
          </div>
          {errBox}
          {allPosts.length === 0 ? (
            <div style={Object.assign({}, cardStyle, { padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 })}>
              No drafts yet. Go to Briefing and click Generate Posts on a trend.
            </div>
          ) : null}
          {platforms.map(function(plat) {
            var pp = allPosts.filter(function(p) { return (p.platform || "").toLowerCase().indexOf(plat) >= 0; });
            if (pp.length === 0) return null;
            var pc = platColor(plat);
            return (
              <div key={plat} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: pc.bg, border: "1px solid " + pc.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: pc.border }}>{pc.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{pc.label}</span>
                </div>
                {pp.map(function(post, i) {
                  var idx = plat + "-" + i;
                  var isCp = copied[idx] === true;
                  return (
                    <div key={idx} style={{ background: "#fff", borderLeft: "3px solid " + pc.border, borderRadius: "0 10px 10px 0", border: "1px solid #e5e7eb", borderLeftColor: pc.border, borderLeftWidth: 3, padding: 16, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>{post.tone}</span>
                        <button onClick={function() { copyText(post.content, idx); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, fontWeight: 600, cursor: "pointer", background: isCp ? "#059669" : "#fff", color: isCp ? "#fff" : "#0f172a", border: isCp ? "1px solid #059669" : "1px solid #e5e7eb" }}>
                          {isCp ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div style={{ fontSize: 14, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{post.content}</div>
                      {(post.hashtags || []).length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                          {post.hashtags.map(function(h, j) { return <span key={j} style={{ fontSize: 11, color: "#0052ff", background: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>#{h}</span>; })}
                        </div>
                      ) : null}
                      {post.engagement_tip ? (
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, fontStyle: "italic", background: "#f8fafc", padding: "6px 10px", borderRadius: 6 }}>Tip: {post.engagement_tip}</div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== COMPETITORS =====
  if (tab === "competitors") {
    var comps = (data && data.competitors) || [];
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
        {header}{tabBar}
        <div style={ctStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Competitor Intelligence</div>
            <button disabled={loading} onClick={function() { doRefresh("competitors"); }} style={btnGhost}>
              {loading && loadWhat === "competitors" ? "Analyzing..." : "Refresh Competitors"}
            </button>
          </div>
          {errBox}
          {comps.length === 0 ? (
            <div style={Object.assign({}, cardStyle, { padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 })}>
              No competitor data yet. Click Refresh Competitors to analyze.
            </div>
          ) : null}
          {comps.map(function(c, i) {
            return (
              <div key={i} style={cardStyle}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>{c.name}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 2 }}>RECENT MOVES</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{c.recent_moves}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 2 }}>CONTENT STYLE</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{c.content_style}</div>
                </div>
                <div style={{ background: "#eff6ff", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0052ff", marginBottom: 2 }}>OPPORTUNITY FOR XBO</div>
                  <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>{c.opportunity}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== CALENDAR =====
  if (tab === "calendar") {
    var calPosts = (data && data.calendar) || [];
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
        {header}{tabBar}
        <div style={ctStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Content Calendar</div>
            <button disabled={loading} onClick={function() { doRefresh("calendar"); }} style={btnGhost}>
              {loading && loadWhat === "calendar" ? "Planning..." : "Generate Calendar"}
            </button>
          </div>
          {errBox}
          {calPosts.length === 0 ? (
            <div style={Object.assign({}, cardStyle, { padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 })}>
              No calendar yet. Click Generate Calendar to plan today.
            </div>
          ) : null}
          {calPosts.map(function(p, i) {
            var pc = platColor(p.platform || "");
            var catColors = {
              trending: { bg: "#fef2f2", color: "#dc2626" },
              educational: { bg: "#eff6ff", color: "#2563eb" },
              product: { bg: "#f0fdf4", color: "#16a34a" },
              engagement: { bg: "#fefce8", color: "#ca8a04" },
              community: { bg: "#faf5ff", color: "#9333ea" }
            };
            var cc = catColors[p.category] || { bg: "#f1f5f9", color: "#64748b" };
            return (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 8, display: "flex", gap: 14, alignItems: "start" }}>
                <div style={{ minWidth: 60, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{p.time || "--"}</div>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: pc.bg, border: "1px solid " + pc.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: pc.border, margin: "4px auto 0" }}>{pc.icon}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: cc.bg, color: cc.color }}>{(p.category || "").toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{p.tone}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>{p.content}</div>
                </div>
                <button onClick={function() { copyText(p.content, "cal-" + i); }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", background: copied["cal-" + i] ? "#059669" : "#fff", color: copied["cal-" + i] ? "#fff" : "#64748b", border: copied["cal-" + i] ? "1px solid #059669" : "1px solid #e5e7eb", fontWeight: 600 }}>
                  {copied["cal-" + i] ? "Copied!" : "Copy"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>{header}{tabBar}</div>;
}
