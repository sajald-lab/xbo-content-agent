"use client";
import { useState, useEffect } from "react";

var PILLARS = ["Market Commentary", "Product Education", "Community/Memes", "Regulation", "LATAM/Football"];
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

var C = {
  purple: "#6319FF", purple2: "#3B0F99", purple3: "#E5DDF9", purple4: "#CDC6ED",
  purpleBg: "#F4F3F8", textH: "#270A66", textP: "#140533", button: "#140533",
  green: "#49B47A", greenBg: "#E3F9F4", greenAcc: "#70E1C6",
  blue: "#0092D0", blueBg: "#DCE9F4",
  red: "#FD3B5E", redBg: "#FDEEEE",
  grey: "#C4C4C4", white: "#FFFFFF"
};

var pillarColors = {
  "Market Commentary": C.blue, "Product Education": C.green,
  "Community/Memes": "#D97706", "Regulation": C.red, "LATAM/Football": C.purple
};

function platInfo(p) {
  var k = (p || "").toLowerCase();
  if (k.indexOf("twitter") >= 0 || k.indexOf("x ") >= 0 || k === "x") return { border: "#1d9bf0", bg: "#EBF5FF", icon: "X", label: "X / Twitter" };
  if (k.indexOf("linkedin") >= 0) return { border: "#0a66c2", bg: "#EEF3FF", icon: "in", label: "LinkedIn" };
  if (k.indexOf("telegram") >= 0) return { border: C.blue, bg: C.blueBg, icon: "TG", label: "Telegram" };
  return { border: "#C13584", bg: "#FDF2F8", icon: "IG", label: "Instagram" };
}

export default function Dashboard() {
  var _tab = useState("briefing"), tab = _tab[0], setTab = _tab[1];
  var _data = useState(null), data = _data[0], setData = _data[1];
  var _ld = useState(false), loading = _ld[0], setLoading = _ld[1];
  var _lw = useState(""), loadWhat = _lw[0], setLoadWhat = _lw[1];
  var _err = useState(null), err = _err[0], setErr = _err[1];
  var _cp = useState({}), copied = _cp[0], setCopied = _cp[1];
  var _gp = useState(null), genPosts = _gp[0], setGenPosts = _gp[1];
  var _gl = useState(false), genLoading = _gl[0], setGenLoading = _gl[1];
  var _sq = useState(""), searchQuery = _sq[0], setSearchQuery = _sq[1];
  var _sp = useState([]), savedPosts = _sp[0], setSavedPosts = _sp[1];
  var _cal = useState({}), calendarPosts = _cal[0], setCalendarPosts = _cal[1];
  var _pl = useState([]), postedLog = _pl[0], setPostedLog = _pl[1];
  var _ei = useState(null), editingIdx = _ei[0], setEditingIdx = _ei[1];
  var _et = useState(""), editText = _et[0], setEditText = _et[1];
  var _ri = useState(""), replyInput = _ri[0], setReplyInput = _ri[1];
  var _rr = useState(null), replyResult = _rr[0], setReplyResult = _rr[1];
  var _rl = useState(false), replyLoading = _rl[0], setReplyLoading = _rl[1];

  useEffect(function() { fetchData(); }, []);

  function fetchData() { fetch("/api/data").then(function(r) { return r.json(); }).then(function(d) { setData(d); }).catch(function() {}); }

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
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: searchQuery }) })
    .then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGenPosts(d.posts); setTab("drafts"); fetchData(); } else if (d.error) { setErr(d.error); }
      setGenLoading(false);
    }).catch(function() { setErr("Search failed"); setGenLoading(false); });
  }

  function doGenerateForTrend(trend) {
    setGenLoading(true); setGenPosts(null);
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: trend.title + " - " + trend.summary }) })
    .then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGenPosts(d.posts); setTab("drafts"); fetchData(); } else if (d.error) { setErr(d.error); }
      setGenLoading(false);
    }).catch(function() { setErr("Generation failed"); setGenLoading(false); });
  }

  function doRetone(post, tone) {
    setGenLoading(true);
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: "Rewrite in " + tone + " tone for " + post.platform + ": " + post.content }) })
    .then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts && d.posts.length > 0) { var u = (genPosts || (data && data.posts) || []).slice(); var idx = u.indexOf(post); if (idx >= 0) { u[idx] = d.posts[0]; setGenPosts(u); } }
      setGenLoading(false);
    }).catch(function() { setGenLoading(false); });
  }

  function doReplyGenerate() {
    if (!replyInput.trim()) return;
    setReplyLoading(true); setReplyResult(null);
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: "Write a smart reply from XBO.com to: " + replyInput }) })
    .then(function(r) { return r.json(); }).then(function(d) { if (d.posts) { setReplyResult(d.posts); } setReplyLoading(false); })
    .catch(function() { setReplyLoading(false); });
  }

  function savePost(post, pillar) { setSavedPosts(function(p) { return p.concat([Object.assign({}, post, { pillar: pillar, savedAt: new Date().toLocaleString() })]); }); }
  function addToCalendar(post, day) { setCalendarPosts(function(p) { var u = Object.assign({}, p); u[day] = (u[day] || []).concat([Object.assign({}, post, { scheduledDay: day })]); return u; }); }
  function markAsPosted(post) { setPostedLog(function(p) { return p.concat([Object.assign({}, post, { postedAt: new Date().toLocaleString() })]); }); }

  function copyText(text, idx) {
    navigator.clipboard.writeText(text).then(function() {
      var o = {}; o[idx] = true; setCopied(function(p) { return Object.assign({}, p, o); });
      setTimeout(function() { var o2 = {}; o2[idx] = false; setCopied(function(p) { return Object.assign({}, p, o2); }); }, 2000);
    });
  }

  function heatStyle(h) {
    if (h === "hot") return { bg: C.redBg, color: C.red, label: "HOT" };
    if (h === "rising") return { bg: "#FEF9C3", color: "#CA8A04", label: "RISING" };
    return { bg: "#FFF3E0", color: "#EA580C", label: "WARM" };
  }

  // === STYLES ===
  var sPage = { minHeight: "100vh", background: C.purpleBg };
  var sHdr = { background: C.white, borderBottom: "1px solid " + C.purple4, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 };
  var sLogo = { width: 40, height: 40, borderRadius: 10, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, color: C.white, letterSpacing: -1 };
  var sCt = { maxWidth: 980, margin: "0 auto", padding: "24px 20px" };
  var sCard = { background: C.white, border: "1px solid " + C.purple4, borderRadius: 14, padding: 20, marginBottom: 14 };
  var sBtnPrimary = { padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.white, background: C.purple, border: "none", cursor: "pointer" };
  var sBtnGhost = { padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.textP, background: C.white, border: "1px solid " + C.purple4, cursor: "pointer" };
  var sBtnSm = { padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid " + C.purple4, background: C.white, color: C.textP };

  var TABS = [
    { id: "briefing", label: "Briefing" }, { id: "drafts", label: "Drafts" },
    { id: "saved", label: "Saved" }, { id: "calendar", label: "Calendar" },
    { id: "competitors", label: "Competitors" }, { id: "replies", label: "Replies" },
    { id: "tracker", label: "Tracker" }
  ];

  // === HEADER ===
  var header = (
    <div style={sHdr}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={sLogo}>xbo</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.textH }}>Content Command Center</div>
          <div style={{ fontSize: 11, color: C.purple2 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: data && data.lastUpdate ? C.green : C.grey, marginRight: 5, verticalAlign: "middle" }}></span>
            {data && data.lastUpdate ? "Updated " + new Date(data.lastUpdate).toLocaleTimeString() : "Not scanned yet"}
          </div>
        </div>
      </div>
      <button disabled={loading} onClick={function() { doRefresh("all"); }} style={Object.assign({}, sBtnPrimary, loading ? { opacity: 0.5 } : {})}>{loading && loadWhat === "all" ? "Scanning..." : "Refresh All"}</button>
    </div>
  );

  // === TAB BAR ===
  var tabBar = (
    <div style={{ display: "flex", background: C.white, borderBottom: "1px solid " + C.purple4, padding: "0 24px", overflowX: "auto" }}>
      {TABS.map(function(t) {
        var active = tab === t.id;
        return (<div key={t.id} onClick={function() { setTab(t.id); }} style={{
          padding: "12px 16px", fontSize: 13, fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
          color: active ? C.purple : C.textP + "99",
          borderBottom: active ? "2px solid " + C.purple : "2px solid transparent", cursor: "pointer"
        }}>{t.label}{t.id === "saved" && savedPosts.length > 0 ? " (" + savedPosts.length + ")" : ""}</div>);
      })}
    </div>
  );

  var errBox = err ? <div style={{ background: C.redBg, border: "1px solid " + C.red + "40", borderRadius: 10, padding: 14, fontSize: 13, color: C.red, margin: "16px 0" }}>{err}</div> : null;

  // === SEARCH BAR ===
  var searchBar = (
    <div style={Object.assign({}, sCard, { display: "flex", gap: 8, alignItems: "center", padding: 14 })}>
      <input value={searchQuery} onChange={function(e) { setSearchQuery(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") doSearch(); }}
        placeholder="Search any topic... (Bitcoin ETF, Solana memecoins, Argentina crypto)"
        style={{ flex: 1, border: "1px solid " + C.purple4, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.textP, outline: "none", fontFamily: "inherit" }} />
      <button disabled={genLoading} onClick={doSearch} style={Object.assign({}, sBtnPrimary, { whiteSpace: "nowrap" }, genLoading ? { opacity: 0.5 } : {})}>{genLoading ? "Searching..." : "Search + Generate"}</button>
    </div>
  );

  // === POST CARD ===
  function renderPostCard(post, i, prefix) {
    var idx = prefix + "-" + i;
    var isCp = copied[idx] === true;
    var isEd = editingIdx === idx;
    var pc = platInfo(post.platform);
    var plr = post.pillar;

    return (
      <div key={idx} style={{ background: C.white, borderLeft: "3px solid " + pc.border, borderRadius: "0 12px 12px 0", border: "1px solid " + C.purple4, borderLeftColor: pc.border, borderLeftWidth: 3, padding: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: pc.border }}>{pc.label}</span>
            <span style={{ fontSize: 10, color: C.textP + "80", background: C.purpleBg, padding: "2px 8px", borderRadius: 4 }}>{post.tone}</span>
            {plr ? <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: (pillarColors[plr] || C.grey) + "18", color: pillarColors[plr] || C.grey, fontWeight: 600 }}>{plr}</span> : null}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={function() { copyText(isEd ? editText : post.content, idx); }} style={Object.assign({}, sBtnSm, isCp ? { background: C.green, color: C.white, borderColor: C.green } : {})}>{isCp ? "Copied!" : "Copy"}</button>
            <button onClick={function() { if (isEd) { post.content = editText; setEditingIdx(null); } else { setEditingIdx(idx); setEditText(post.content); } }} style={sBtnSm}>{isEd ? "Save" : "Edit"}</button>
          </div>
        </div>

        {isEd ? (
          <textarea value={editText} onChange={function(e) { setEditText(e.target.value); }}
            style={{ width: "100%", border: "1px solid " + C.purple3, borderRadius: 10, padding: 12, fontSize: 13, color: C.textP, lineHeight: 1.6, minHeight: 80, fontFamily: "inherit", resize: "vertical" }} />
        ) : (
          <div style={{ fontSize: 14, color: C.textP, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{post.content}</div>
        )}

        {(post.hashtags || []).length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {post.hashtags.map(function(h, j) { return <span key={j} style={{ fontSize: 11, color: C.purple, background: C.purple3, padding: "2px 6px", borderRadius: 4 }}>#{h}</span>; })}
          </div>
        ) : null}

        {post.engagement_tip ? <div style={{ fontSize: 12, color: C.textP + "80", marginTop: 8, fontStyle: "italic", background: C.purpleBg, padding: "6px 10px", borderRadius: 8 }}>Tip: {post.engagement_tip}</div> : null}

        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={function() { doRetone(post, "professional"); }} style={Object.assign({}, sBtnSm, { color: C.purple2 })} disabled={genLoading}>Professional</button>
          <button onClick={function() { doRetone(post, "casual funny"); }} style={Object.assign({}, sBtnSm, { color: C.blue })} disabled={genLoading}>Casual</button>
          <button onClick={function() { doRetone(post, "bold hot take"); }} style={Object.assign({}, sBtnSm, { color: C.red })} disabled={genLoading}>Spicy</button>
          <span style={{ width: 1, background: C.purple4, margin: "0 2px" }}></span>
          {PILLARS.map(function(p) { return <button key={p} onClick={function() { savePost(post, p); }} style={Object.assign({}, sBtnSm, { color: pillarColors[p], borderColor: (pillarColors[p] || C.grey) + "40", fontSize: 9 })}>{p}</button>; })}
          <span style={{ width: 1, background: C.purple4, margin: "0 2px" }}></span>
          {DAYS.slice(0, 5).map(function(d) { return <button key={d} onClick={function() { addToCalendar(post, d); }} style={Object.assign({}, sBtnSm, { fontSize: 9, color: C.purple2 })}>{d.substring(0, 3)}</button>; })}
        </div>
      </div>
    );
  }

  // === BRIEFING ===
  if (tab === "briefing") {
    var trends = data && data.trends ? data.trends : [];
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        {searchBar}
        {data && data.lastUpdate ? (
          <div style={{ background: "linear-gradient(135deg, " + C.purple + ", " + C.purple2 + ")", borderRadius: 16, padding: "22px 26px", marginBottom: 22, color: C.white }}>
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>Market Mood</div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{data.market_mood || "Analyzing..."}</div>
          </div>
        ) : (
          <div style={Object.assign({}, sCard, { padding: 48, textAlign: "center" })}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textH, marginBottom: 8 }}>Welcome to your Content Command Center</div>
            <div style={{ fontSize: 14, color: C.textP + "90", marginBottom: 24 }}>Click Refresh All to scan crypto trends, or search any topic above.</div>
            <button disabled={loading} onClick={function() { doRefresh("all"); }} style={sBtnPrimary}>{loading ? "Scanning..." : "Run First Scan"}</button>
          </div>
        )}
        {errBox}
        {trends.length > 0 && (<div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textH, marginBottom: 14 }}>Trending Now ({trends.length})</div>
          {trends.map(function(t, i) {
            var hc = heatStyle(t.heat);
            return (
              <div key={i} style={sCard}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: hc.bg, color: hc.color }}>{hc.label}</span>
                      <span style={{ fontSize: 11, color: C.textP + "70" }}>{t.category}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textH, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 13, color: C.textP + "90", lineHeight: 1.55 }}>{t.summary}</div>
                  </div>
                  <button disabled={genLoading} onClick={function() { doGenerateForTrend(t); }}
                    style={{ padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, color: C.purple, background: C.purple3, border: "1px solid " + C.purple4, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {genLoading ? "..." : "Generate Posts"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>)}
      </div></div>
    );
  }

  // === DRAFTS ===
  if (tab === "drafts") {
    var allPosts = genPosts || (data && data.posts) || [];
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        {searchBar}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textH }}>Drafts ({allPosts.length})</div>
          <button disabled={loading} onClick={function() { doRefresh("posts"); }} style={sBtnGhost}>{loading && loadWhat === "posts" ? "Generating..." : "Regenerate"}</button>
        </div>
        {errBox}
        {allPosts.length === 0 ? <div style={Object.assign({}, sCard, { textAlign: "center", color: C.textP + "70", fontSize: 13, padding: 36 })}>No drafts yet. Search a topic or refresh trends.</div> : null}
        {allPosts.map(function(post, i) { return renderPostCard(post, i, "draft"); })}
      </div></div>
    );
  }

  // === SAVED ===
  if (tab === "saved") {
    var grouped = {};
    for (var i = 0; i < savedPosts.length; i++) { var p = savedPosts[i].pillar || "Uncategorized"; if (!grouped[p]) grouped[p] = []; grouped[p].push(savedPosts[i]); }
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textH }}>Saved Posts ({savedPosts.length})</div>
          {savedPosts.length > 0 ? <button onClick={function() { setSavedPosts([]); }} style={sBtnGhost}>Clear All</button> : null}
        </div>
        {savedPosts.length === 0 ? <div style={Object.assign({}, sCard, { textAlign: "center", color: C.textP + "70", fontSize: 13, padding: 36 })}>Save posts from Drafts using the pillar buttons.</div> : null}
        {PILLARS.map(function(pillar) {
          var posts = grouped[pillar] || []; if (posts.length === 0) return null;
          return (<div key={pillar} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: pillarColors[pillar] }}></span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textH }}>{pillar} ({posts.length})</span>
            </div>
            {posts.map(function(post, j) { return renderPostCard(post, j, "saved-" + pillar); })}
          </div>);
        })}
      </div></div>
    );
  }

  // === CALENDAR ===
  if (tab === "calendar") {
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textH }}>Weekly Content Calendar</div>
          <button disabled={loading} onClick={function() { doRefresh("calendar"); }} style={sBtnGhost}>{loading && loadWhat === "calendar" ? "Planning..." : "Auto-Generate"}</button>
        </div>
        {errBox}
        {DAYS.map(function(day) {
          var posts = calendarPosts[day] || [];
          return (<div key={day} style={Object.assign({}, sCard, { padding: 16 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: posts.length > 0 ? 10 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textH }}>{day}</div>
              <span style={{ fontSize: 11, color: C.textP + "60" }}>{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
            </div>
            {posts.map(function(post, j) {
              var pc = platInfo(post.platform);
              return (<div key={j} style={{ background: C.purpleBg, borderRadius: 10, padding: 12, marginBottom: 6, borderLeft: "3px solid " + pc.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: pc.border }}>{pc.label}</span>
                    {post.pillar ? <span style={{ fontSize: 9, color: pillarColors[post.pillar], fontWeight: 600 }}>{post.pillar}</span> : null}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={function() { copyText(post.content, "c-" + day + "-" + j); }} style={Object.assign({}, sBtnSm, copied["c-" + day + "-" + j] ? { background: C.green, color: C.white } : {})}>{copied["c-" + day + "-" + j] ? "Copied!" : "Copy"}</button>
                    <button onClick={function() { markAsPosted(post); }} style={Object.assign({}, sBtnSm, { color: C.green, borderColor: C.green + "40" })}>Posted</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.textP, lineHeight: 1.5 }}>{post.content}</div>
              </div>);
            })}
            {posts.length === 0 ? <div style={{ fontSize: 12, color: C.textP + "40", fontStyle: "italic" }}>Add posts from Drafts using the day buttons</div> : null}
          </div>);
        })}
      </div></div>
    );
  }

  // === COMPETITORS ===
  if (tab === "competitors") {
    var comps = (data && data.competitors) || [];
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.textH }}>Competitor Intelligence</div>
          <button disabled={loading} onClick={function() { doRefresh("competitors"); }} style={sBtnGhost}>{loading && loadWhat === "competitors" ? "Analyzing..." : "Refresh"}</button>
        </div>
        {errBox}
        {comps.length === 0 ? <div style={Object.assign({}, sCard, { textAlign: "center", color: C.textP + "70", fontSize: 13, padding: 36 })}>Click Refresh to analyze competitors.</div> : null}
        {comps.map(function(c, i) {
          return (<div key={i} style={sCard}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.textH, marginBottom: 12 }}>{c.name}</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textP + "60", marginBottom: 2, letterSpacing: 0.5, textTransform: "uppercase" }}>Recent Moves</div>
              <div style={{ fontSize: 13, color: C.textP + "CC", lineHeight: 1.55 }}>{c.recent_moves}</div>
            </div>
            <div style={{ background: C.purple3, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 2, letterSpacing: 0.5, textTransform: "uppercase" }}>Opportunity for XBO</div>
              <div style={{ fontSize: 13, color: C.purple2, lineHeight: 1.55 }}>{c.opportunity}</div>
            </div>
          </div>);
        })}
      </div></div>
    );
  }

  // === REPLIES ===
  if (tab === "replies") {
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.textH, marginBottom: 14 }}>Engagement Reply Generator</div>
        <div style={Object.assign({}, sCard, { padding: 18 })}>
          <div style={{ fontSize: 13, color: C.textP + "80", marginBottom: 12 }}>Paste a tweet or topic and generate a smart reply from XBO.com.</div>
          <textarea value={replyInput} onChange={function(e) { setReplyInput(e.target.value); }} placeholder="Paste the tweet or describe the conversation..."
            style={{ width: "100%", border: "1px solid " + C.purple4, borderRadius: 10, padding: 14, fontSize: 13, minHeight: 80, fontFamily: "inherit", resize: "vertical", marginBottom: 12, color: C.textP }} />
          <button disabled={replyLoading} onClick={doReplyGenerate} style={Object.assign({}, sBtnPrimary, replyLoading ? { opacity: 0.5 } : {})}>{replyLoading ? "Generating..." : "Generate Reply"}</button>
        </div>
        {errBox}
        {replyResult ? (<div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textH, margin: "18px 0 10px" }}>Suggested Replies</div>
          {replyResult.map(function(r, i) { return renderPostCard(r, i, "reply"); })}
        </div>) : null}
      </div></div>
    );
  }

  // === TRACKER ===
  if (tab === "tracker") {
    var byPlat = {}, byPil = {};
    for (var i = 0; i < postedLog.length; i++) { var p = postedLog[i].platform || "Unknown"; var pl = postedLog[i].pillar || "Untagged"; byPlat[p] = (byPlat[p] || 0) + 1; byPil[pl] = (byPil[pl] || 0) + 1; }
    return (
      <div style={sPage}>{header}{tabBar}<div style={sCt}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.textH, marginBottom: 16 }}>Performance Tracker</div>
        <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
          <div style={Object.assign({}, sCard, { flex: 1, minWidth: 140, textAlign: "center", padding: 24 })}>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.purple }}>{postedLog.length}</div>
            <div style={{ fontSize: 12, color: C.textP + "80" }}>Posts Published</div>
          </div>
          <div style={Object.assign({}, sCard, { flex: 1, minWidth: 140, textAlign: "center", padding: 24 })}>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.green }}>{savedPosts.length}</div>
            <div style={{ fontSize: 12, color: C.textP + "80" }}>Posts Saved</div>
          </div>
          <div style={Object.assign({}, sCard, { flex: 1, minWidth: 140, textAlign: "center", padding: 24 })}>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.blue }}>{Object.keys(byPlat).length}</div>
            <div style={{ fontSize: 12, color: C.textP + "80" }}>Platforms Active</div>
          </div>
        </div>
        {Object.keys(byPlat).length > 0 ? (<div style={Object.assign({}, sCard, { marginBottom: 16 })}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textH, marginBottom: 12 }}>Posts by Platform</div>
          {Object.keys(byPlat).map(function(p) {
            var pc = platInfo(p); var pct = Math.round((byPlat[p] / postedLog.length) * 100);
            return (<div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textH, minWidth: 80 }}>{p}</span>
              <div style={{ flex: 1, background: C.purpleBg, borderRadius: 6, height: 22 }}>
                <div style={{ width: pct + "%", background: pc.border, borderRadius: 6, height: 22, minWidth: 20 }}></div>
              </div>
              <span style={{ fontSize: 12, color: C.textP + "80", minWidth: 30 }}>{byPlat[p]}</span>
            </div>);
          })}
        </div>) : null}
        {Object.keys(byPil).length > 0 ? (<div style={Object.assign({}, sCard, { marginBottom: 16 })}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textH, marginBottom: 12 }}>Posts by Pillar</div>
          {Object.keys(byPil).map(function(p) {
            var pct = Math.round((byPil[p] / postedLog.length) * 100);
            return (<div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textH, minWidth: 120 }}>{p}</span>
              <div style={{ flex: 1, background: C.purpleBg, borderRadius: 6, height: 22 }}>
                <div style={{ width: pct + "%", background: pillarColors[p] || C.grey, borderRadius: 6, height: 22, minWidth: 20 }}></div>
              </div>
              <span style={{ fontSize: 12, color: C.textP + "80", minWidth: 30 }}>{byPil[p]}</span>
            </div>);
          })}
        </div>) : null}
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textH, marginBottom: 10 }}>Recent Activity</div>
        {postedLog.length === 0 ? <div style={Object.assign({}, sCard, { textAlign: "center", color: C.textP + "70", fontSize: 13, padding: 30 })}>Mark posts as Posted from Calendar.</div> : null}
        {postedLog.slice().reverse().slice(0, 20).map(function(p, i) {
          var pc = platInfo(p.platform);
          return (<div key={i} style={Object.assign({}, sCard, { padding: 14, display: "flex", gap: 10, alignItems: "start" })}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: pc.bg, border: "1px solid " + pc.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: pc.border, flexShrink: 0 }}>{pc.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.textP, lineHeight: 1.4 }}>{p.content && p.content.length > 100 ? p.content.substring(0, 100) + "..." : p.content}</div>
              <div style={{ fontSize: 10, color: C.textP + "60", marginTop: 4 }}>{p.postedAt}{p.pillar ? " | " + p.pillar : ""}</div>
            </div>
          </div>);
        })}
      </div></div>
    );
  }

  return <div style={sPage}>{header}{tabBar}</div>;
}
