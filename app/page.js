"use client";
import { useState, useEffect } from "react";

var TABS = [
  { id: "briefing", label: "Today's Briefing" },
  { id: "drafts", label: "Drafts" },
  { id: "competitors", label: "Competitors" },
  { id: "calendar", label: "Calendar" }
];

export default function Dashboard() {
  var ts = useState("briefing"); var tab = ts[0]; var setTab = ts[1];
  var ds = useState(null); var data = ds[0]; var setData = ds[1];
  var ls = useState(false); var loading = ls[0]; var setLoading = ls[1];
  var lws = useState(""); var loadWhat = lws[0]; var setLoadWhat = lws[1];
  var es = useState(null); var err = es[0]; var setErr = es[1];
  var cs = useState({}); var copied = cs[0]; var setCopied = cs[1];
  var gs = useState(null); var genPosts = gs[0]; var setGenPosts = gs[1];
  var gls = useState(false); var genLoading = gls[0]; var setGenLoading = gls[1];

  useEffect(function() { fetchData(); }, []);

  function fetchData() {
    fetch("/api/data").then(function(r) { return r.json(); }).then(function(d) { setData(d); }).catch(function() {});
  }

  function doRefresh(section) {
    setLoading(true);
    setLoadWhat(section);
    setErr(null);
    fetch("/api/scan?section=" + section).then(function(r) { return r.json(); }).then(function(d) {
      if (d.error) { setErr(d.error); } else { fetchData(); }
      setLoading(false);
    }).catch(function() { setErr("Scan failed"); setLoading(false); });
  }

  function doGenerateForTrend(trend) {
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
