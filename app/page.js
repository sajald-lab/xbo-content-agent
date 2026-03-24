"use client";
import { useState, useEffect } from "react";

var C = { purple: "#6319FF", p2: "#3B0F99", p3: "#E5DDF9", p4: "#CDC6ED", pbg: "#F4F3F8", th: "#270A66", tp: "#140533", green: "#49B47A", gbg: "#E3F9F4", blue: "#0092D0", bbg: "#DCE9F4", red: "#FD3B5E", rbg: "#FDEEEE", grey: "#C4C4C4", w: "#FFFFFF" };
var PILLARS = ["Market Commentary", "Product Education", "Community/Memes", "Regulation", "LATAM/Football"];
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var PLATS = ["X Twitter", "LinkedIn", "Telegram", "Instagram"];
var pillarC = { "Market Commentary": C.blue, "Product Education": C.green, "Community/Memes": "#D97706", "Regulation": C.red, "LATAM/Football": C.purple };
var RELEASE_NOTES = [
  { ver: "1.0", date: "Mar 24, 2026", notes: "Initial launch with trend research, post generation, competitor analysis, calendar, and performance tracking." },
  { ver: "1.1", date: "Mar 24, 2026", notes: "Added XBO.com branding, platform-specific generation, research tab, engagement replies, content pillars, saved library." },
  { ver: "1.2", date: "Mar 24, 2026", notes: "Added login, onboarding tour, sample data, how-to guide, activity log with release notes, custom research inputs." }
];
var SAMPLE = {
  trends: [
    { title: "Bitcoin Tests $90K Resistance", summary: "Bitcoin is approaching the key $90,000 level with strong institutional buying pressure from ETF inflows.", hashtags: ["Bitcoin", "BTC", "ETF"], heat: "hot", category: "Market", source: "CoinDesk" },
    { title: "Ethereum Layer 2 TVL Hits Record", summary: "Total value locked across Ethereum L2 networks surpassed $50B for the first time, led by Arbitrum and Base.", hashtags: ["Ethereum", "L2", "DeFi"], heat: "rising", category: "DeFi", source: "The Block" },
    { title: "SEC Approves New Crypto ETFs", summary: "The SEC greenlit three new altcoin ETFs, expanding regulated crypto investment options for institutions.", hashtags: ["SEC", "ETF", "Regulation"], heat: "hot", category: "Regulation", source: "CoinTelegraph" },
    { title: "Solana Memecoin Season Returns", summary: "New memecoin launches on Solana are driving record DEX volumes, with several tokens gaining 1000%+ in days.", hashtags: ["Solana", "Memecoins", "SOL"], heat: "warm", category: "Trending", source: "Decrypt" },
    { title: "Argentina Crypto Adoption Surges", summary: "Argentina sees record P2P crypto trading volumes as inflation hits new highs, with stablecoin adoption leading.", hashtags: ["Argentina", "LATAM", "Stablecoins"], heat: "rising", category: "LATAM", source: "BeInCrypto" }
  ],
  market_mood: "Cautiously bullish. Institutional flows strong, retail FOMO building, but macro uncertainty lingers.",
  posts: [
    { platform: "X Twitter", tone: "Bold Hot Take", content: "Bitcoin at $90K isn't the top. It's the starting line.\n\nInstitutions are just getting warmed up. $XBO #Bitcoin #BTC", hashtags: ["Bitcoin", "BTC", "XBO"], engagement_tip: "Post during US market open for max visibility" },
    { platform: "X Twitter", tone: "Casual", content: "Ethereum L2s just hit $50B TVL.\n\nThe future isn't coming. It's already here.\n\nTrade ETH on XBO.com #Ethereum #DeFi", hashtags: ["Ethereum", "DeFi"], engagement_tip: "Quote tweet a major L2 announcement" },
    { platform: "LinkedIn", tone: "Professional", content: "The SEC just approved three new altcoin ETFs, marking a pivotal moment for regulated crypto investment.\n\nAt XBO.com, we've been preparing for this shift. As institutional access expands, the gap between traditional finance and crypto continues to narrow.\n\nWhat does this mean for your portfolio strategy?", hashtags: ["CryptoETF", "Regulation"], engagement_tip: "Tag finance professionals in comments" },
    { platform: "LinkedIn", tone: "Educational", content: "Ethereum Layer 2 networks just crossed $50B in total value locked. Here's why that matters:\n\nLower fees. Faster transactions. Better scalability.\n\nThe infrastructure for mass adoption is being built right now. XBO.com supports trading across major L2 tokens.\n\nAre you positioned for the L2 wave?", hashtags: ["Ethereum", "Web3"], engagement_tip: "Share with a personal insight about L2 adoption" },
    { platform: "Telegram", tone: "Community", content: "BTC pushing $90K and the vibes are immaculate. Who's watching the charts right now? Drop your predictions below. Trade BTC with up to 100x leverage on XBO.com", hashtags: ["Bitcoin"], engagement_tip: "Pin message and create a poll" },
    { platform: "Telegram", tone: "News Alert", content: "BREAKING: SEC approves 3 new altcoin ETFs. Institutional money is about to flow even harder. XBO.com has you covered with 200+ trading pairs.", hashtags: ["SEC", "ETF"], engagement_tip: "Follow up with a detailed analysis post" },
    { platform: "Instagram", tone: "Hook", content: "Bitcoin at $90K and people are STILL sleeping on crypto.\n\nHere's what the smart money is doing right now...\n\nInstitutions added $1.2B in ETF inflows last week alone. The trend is clear.\n\nStart your crypto journey at XBO.com\n\n#Bitcoin #Crypto #BTC #Trading #XBO #CryptoTrading #Investing", hashtags: ["Bitcoin", "Crypto"], engagement_tip: "Use a chart screenshot as the image" },
    { platform: "Instagram", tone: "Educational", content: "Layer 2 networks explained in 10 seconds:\n\nFaster. Cheaper. Same security as Ethereum.\n\n$50B is now locked in L2 networks. That's bigger than most banks.\n\nTrade L2 tokens on XBO.com\n\n#Ethereum #DeFi #Web3 #Crypto #XBO #Layer2 #CryptoEducation", hashtags: ["Ethereum", "Web3"], engagement_tip: "Create a carousel with L2 comparison stats" }
  ],
  competitors: [
    { name: "Binance", recent_moves: "Launched new earn products and expanded futures pairs. Heavy social media push around fee discounts.", content_style: "High volume, promotional, feature-focused", opportunity: "XBO can differentiate with personalized service and regulated EU positioning vs Binance's regulatory challenges." },
    { name: "Coinbase", recent_moves: "Focused on institutional messaging and Base L2 ecosystem growth. Premium brand positioning.", content_style: "Professional, compliance-forward, educational", opportunity: "XBO can capture the LATAM audience that Coinbase underserves, leveraging the Argentina partnership." },
    { name: "OKX", recent_moves: "Sports sponsorships and Web3 wallet features. Aggressive expansion in emerging markets.", content_style: "Young, sporty, Web3-native", opportunity: "XBO's football sponsorship directly competes. Create content around shared audience of sports and crypto fans." }
  ]
};

var TOUR_STEPS = [
  { title: "Welcome to XBO Pulse", desc: "Your AI-powered content command center. Research trends, generate posts, track competitors, and plan your content calendar all in one place." },
  { title: "Briefing Tab", desc: "Start here every morning. Search any topic or hit Refresh All to scan the latest crypto trends. Click 'Generate Posts' on any trend to create platform-ready content." },
  { title: "Choose Platforms", desc: "Select which platforms to generate for. Each post follows best practices: X (280 chars, hooks), LinkedIn (professional, CTA), Telegram (community, emojis), Instagram (visual hooks, hashtags)." },
  { title: "Drafts Tab", desc: "All generated posts land here. Edit inline, change the tone (Professional/Casual/Spicy), save to your library with a content pillar tag, or schedule to a day on the calendar." },
  { title: "Research Tab", desc: "Deep dive into any topic. Type a competitor name, X handle, website, or trend to get AI-powered research insights." },
  { title: "Calendar + Tracker", desc: "Plan your week visually. Mark posts as 'Posted' to track your output. The Tracker tab shows your publishing stats by platform and content pillar." }
];

function pi(p) {
  var k = (p || "").toLowerCase();
  if (k.indexOf("twitter") >= 0 || k.indexOf("x ") >= 0 || k === "x") return { b: "#1d9bf0", bg: "#EBF5FF", ic: "X", lb: "X / Twitter" };
  if (k.indexOf("linkedin") >= 0) return { b: "#0a66c2", bg: "#EEF3FF", ic: "in", lb: "LinkedIn" };
  if (k.indexOf("telegram") >= 0) return { b: C.blue, bg: C.bbg, ic: "TG", lb: "Telegram" };
  return { b: "#C13584", bg: "#FDF2F8", ic: "IG", lb: "Instagram" };
}

export default function App() {
  var _a = useState(false), authed = _a[0], setAuthed = _a[1];
  var _em = useState(""), email = _em[0], setEmail = _em[1];
  var _pw = useState(""), pass = _pw[0], setPass = _pw[1];
  var _le = useState(""), loginErr = _le[0], setLoginErr = _le[1];
  var _tour = useState(-1), tourStep = _tour[0], setTourStep = _tour[1];
  var _tab = useState("briefing"), tab = _tab[0], setTab = _tab[1];
  var _data = useState(null), data = _data[0], setData = _data[1];
  var _ld = useState(false), ld = _ld[0], setLd = _ld[1];
  var _lw = useState(""), lw = _lw[0], setLw = _lw[1];
  var _err = useState(null), err = _err[0], setErr = _err[1];
  var _cp = useState({}), copied = _cp[0], setCp = _cp[1];
  var _gp = useState(null), gp = _gp[0], setGp = _gp[1];
  var _gl = useState(false), gl = _gl[0], setGl = _gl[1];
  var _sq = useState(""), sq = _sq[0], setSq = _sq[1];
  var _sp = useState([]), saved = _sp[0], setSaved = _sp[1];
  var _cal = useState({}), calP = _cal[0], setCalP = _cal[1];
  var _pl = useState([]), posted = _pl[0], setPosted = _pl[1];
  var _ei = useState(null), eIdx = _ei[0], setEIdx = _ei[1];
  var _et = useState(""), eTxt = _et[0], setETxt = _et[1];
  var _ri = useState(""), rIn = _ri[0], setRIn = _ri[1];
  var _rr = useState(null), rRes = _rr[0], setRRes = _rr[1];
  var _rl = useState(false), rLd = _rl[0], setRLd = _rl[1];
  var _selP = useState(["X Twitter", "LinkedIn", "Telegram", "Instagram"]), selPlats = _selP[0], setSelPlats = _selP[1];
  var _rq = useState(""), resQ = _rq[0], setResQ = _rq[1];
  var _rf = useState(null), resFin = _rf[0], setResFin = _rf[1];
  var _rfl = useState(false), resLd = _rfl[0], setResLd = _rfl[1];
  var _help = useState(false), showHelp = _help[0], setShowHelp = _help[1];
  var _log = useState([]), actLog = _log[0], setActLog = _log[1];
  var _useSample = useState(true), useSample = _useSample[0], setUseSample = _useSample[1];

  useEffect(function() { if (authed) fetchData(); }, [authed]);

  function addLog(action) { setActLog(function(p) { return [{ action: action, time: new Date().toLocaleString() }].concat(p).slice(0, 50); }); }
  function fetchData() { fetch("/api/data").then(function(r) { return r.json(); }).then(function(d) { if (d && d.lastUpdate) { setData(d); setUseSample(false); } }).catch(function() {}); }
  function getD() { return useSample ? SAMPLE : (data || SAMPLE); }

  function doRefresh(section) {
    setLd(true); setLw(section); setErr(null); addLog("Refreshed " + section);
    fetch("/api/scan?section=" + section + "&platforms=" + selPlats.join(",")).then(function(r) { return r.json(); }).then(function(d) {
      if (d.error) { setErr(d.error); } else { fetchData(); setUseSample(false); }
      setLd(false);
    }).catch(function() { setErr("Scan failed"); setLd(false); });
  }

  function doSearch() {
    if (!sq.trim()) return;
    setGl(true); setGp(null); setErr(null); addLog("Searched: " + sq);
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: sq, platforms: selPlats }) })
    .then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGp(d.posts); setTab("drafts"); setUseSample(false); } else if (d.error) { setErr(d.error); }
      setGl(false);
    }).catch(function() { setErr("Search failed"); setGl(false); });
  }

  function doGenTrend(t) {
    setGl(true); setGp(null); addLog("Generated posts for: " + t.title);
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: t.title + " - " + t.summary, platforms: selPlats }) })
    .then(function(r) { return r.json(); }).then(function(d) {
      if (d.posts) { setGp(d.posts); setTab("drafts"); setUseSample(false); } else if (d.error) { setErr(d.error); }
      setGl(false);
    }).catch(function() { setErr("Generation failed"); setGl(false); });
  }

  function doRetone(post, tone) {
    setGl(true); addLog("Retoned post to " + tone);
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: "Rewrite in " + tone + " tone for " + post.platform + ": " + post.content, platforms: [post.platform] }) })
    .then(function(r) { return r.json(); }).then(function(d) { if (d.posts && d.posts[0]) { var u = (gp || getD().posts || []).slice(); var i = u.indexOf(post); if (i >= 0) u[i] = d.posts[0]; setGp(u); } setGl(false); })
    .catch(function() { setGl(false); });
  }

  function doReply() {
    if (!rIn.trim()) return;
    setRLd(true); setRRes(null); addLog("Generated reply");
    fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: "Write smart reply from XBO.com to: " + rIn, platforms: selPlats }) })
    .then(function(r) { return r.json(); }).then(function(d) { if (d.posts) setRRes(d.posts); setRLd(false); }).catch(function() { setRLd(false); });
  }

  function doResearch() {
    if (!resQ.trim()) return;
    setResLd(true); setResFin(null); addLog("Researched: " + resQ);
    fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: resQ }) })
    .then(function(r) { return r.json(); }).then(function(d) { if (d.findings) setResFin(d.findings); else if (d.error) setErr(d.error); setResLd(false); })
    .catch(function() { setErr("Research failed"); setResLd(false); });
  }

  function saveP(post, pillar) { setSaved(function(p) { return p.concat([Object.assign({}, post, { pillar: pillar, savedAt: new Date().toLocaleString() })]); }); addLog("Saved post: " + pillar); }
  function addCal(post, day) { setCalP(function(p) { var u = Object.assign({}, p); u[day] = (u[day] || []).concat([Object.assign({}, post, { scheduledDay: day })]); return u; }); addLog("Scheduled to " + day); }
  function markPosted(post) { setPosted(function(p) { return p.concat([Object.assign({}, post, { postedAt: new Date().toLocaleString() })]); }); addLog("Marked as posted"); }
  function cpTxt(text, idx) { navigator.clipboard.writeText(text); var o = {}; o[idx] = true; setCp(function(p) { return Object.assign({}, p, o); }); setTimeout(function() { var o2 = {}; o2[idx] = false; setCp(function(p) { return Object.assign({}, p, o2); }); }, 2000); addLog("Copied post"); }

  function hs(h) { if (h === "hot") return { bg: C.rbg, c: C.red, l: "HOT" }; if (h === "rising") return { bg: "#FEF9C3", c: "#CA8A04", l: "RISING" }; return { bg: "#FFF3E0", c: "#EA580C", l: "WARM" }; }

  var sP = { minHeight: "100vh", background: C.pbg };
  var sH = { background: C.w, borderBottom: "1px solid " + C.p4, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 };
  var sL = { width: 40, height: 40, borderRadius: 10, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: C.w };
  var sC = { maxWidth: 1000, margin: "0 auto", padding: "24px 20px" };
  var sK = { background: C.w, border: "1px solid " + C.p4, borderRadius: 14, padding: 20, marginBottom: 14 };
  var sB = { padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.w, background: C.purple, border: "none", cursor: "pointer" };
  var sBG = { padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: C.tp, background: C.w, border: "1px solid " + C.p4, cursor: "pointer" };
  var sBs = { padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", border: "1px solid " + C.p4, background: C.w, color: C.tp };

  // === LOGIN ===
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: C.pbg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.w, borderRadius: 20, padding: 40, maxWidth: 400, width: "100%", textAlign: "center", border: "1px solid " + C.p4 }}>
          <div style={Object.assign({}, sL, { margin: "0 auto 16px", width: 50, height: 50, fontSize: 18 })}>xbo</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.th, marginBottom: 4 }}>XBO Pulse</div>
          <div style={{ fontSize: 13, color: C.tp + "80", marginBottom: 24 }}>Content Intelligence Dashboard</div>
          <input value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="Email" style={{ width: "100%", padding: "12px 14px", border: "1px solid " + C.p4, borderRadius: 10, fontSize: 13, marginBottom: 10, fontFamily: "inherit", color: C.tp }} />
          <input value={pass} onChange={function(e) { setPass(e.target.value); }} type="password" placeholder="Password"
            onKeyDown={function(e) { if (e.key === "Enter") { if (email === "admin@xbo.com" && pass === "xbopulse2024") { setAuthed(true); setTourStep(0); } else { setLoginErr("Invalid credentials"); } } }}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid " + C.p4, borderRadius: 10, fontSize: 13, marginBottom: 10, fontFamily: "inherit", color: C.tp }} />
          {loginErr ? <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{loginErr}</div> : null}
          <button onClick={function() { if (email === "admin@xbo.com" && pass === "xbopulse2024") { setAuthed(true); setTourStep(0); } else { setLoginErr("Invalid credentials"); } }} style={Object.assign({}, sB, { width: "100%", padding: 14 })}>Sign In</button>
          <div style={{ marginTop: 20, background: C.p3, borderRadius: 10, padding: 14, fontSize: 11, color: C.p2, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Demo Credentials:</div>
            Email: admin@xbo.com<br />Password: xbopulse2024
          </div>
        </div>
      </div>
    );
  }

  var TABS = [
    { id: "briefing", l: "Briefing" }, { id: "drafts", l: "Drafts" }, { id: "saved", l: "Saved" },
    { id: "calendar", l: "Calendar" }, { id: "research", l: "Research" }, { id: "replies", l: "Replies" },
    { id: "tracker", l: "Tracker" }, { id: "activity", l: "Activity" }
  ];

  // === TOUR OVERLAY ===
  var tourOverlay = tourStep >= 0 && tourStep < TOUR_STEPS.length ? (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(20,5,51,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.w, borderRadius: 20, padding: 36, maxWidth: 480, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.purple, fontWeight: 600, marginBottom: 8 }}>STEP {tourStep + 1} OF {TOUR_STEPS.length}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.th, marginBottom: 10 }}>{TOUR_STEPS[tourStep].title}</div>
        <div style={{ fontSize: 14, color: C.tp + "CC", lineHeight: 1.6, marginBottom: 24 }}>{TOUR_STEPS[tourStep].desc}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {tourStep > 0 ? <button onClick={function() { setTourStep(tourStep - 1); }} style={sBG}>Back</button> : null}
          {tourStep < TOUR_STEPS.length - 1 ? (
            <button onClick={function() { setTourStep(tourStep + 1); }} style={sB}>Next</button>
          ) : (
            <button onClick={function() { setTourStep(-1); }} style={sB}>Get Started</button>
          )}
          <button onClick={function() { setTourStep(-1); }} style={Object.assign({}, sBG, { fontSize: 11, color: C.tp + "60" })}>Skip Tour</button>
        </div>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>
          {TOUR_STEPS.map(function(_, i) { return <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i === tourStep ? C.purple : C.p4 }}></div>; })}
        </div>
      </div>
    </div>
  ) : null;

  // === HELP BUTTON ===
  var helpBtn = (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
      {showHelp ? (
        <div style={{ background: C.w, border: "1px solid " + C.p4, borderRadius: 16, padding: 24, width: 320, maxHeight: 460, overflowY: "auto", boxShadow: "0 8px 30px rgba(99,25,255,0.15)", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.th }}>How to Use XBO Pulse</div>
            <button onClick={function() { setShowHelp(false); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.tp }}>x</button>
          </div>
          <div style={{ fontSize: 12, color: C.tp + "CC", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>1. Briefing</div>
            <div style={{ marginBottom: 12 }}>Start here. Search any topic or click Refresh All to scan trends. Select platforms before generating.</div>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>2. Drafts</div>
            <div style={{ marginBottom: 12 }}>Edit posts inline. Click tone buttons to restyle. Save to library with a content pillar tag. Schedule to calendar days.</div>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>3. Saved Library</div>
            <div style={{ marginBottom: 12 }}>Posts organized by pillar. Your content bank for reuse.</div>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>4. Calendar</div>
            <div style={{ marginBottom: 12 }}>Weekly view. Posts added from Drafts. Click Posted when published.</div>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>5. Research</div>
            <div style={{ marginBottom: 12 }}>Type any competitor, influencer, or topic to get AI research.</div>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>6. Replies</div>
            <div style={{ marginBottom: 12 }}>Paste a tweet or topic. Get smart replies from XBO perspective.</div>
            <div style={{ fontWeight: 600, color: C.purple, marginBottom: 4 }}>7. Tracker + Activity</div>
            <div>Track publishing stats and team actions. View release notes.</div>
          </div>
          <button onClick={function() { setTourStep(0); setShowHelp(false); }} style={Object.assign({}, sB, { width: "100%", marginTop: 14, fontSize: 12 })}>Replay Tour</button>
        </div>
      ) : null}
      <button onClick={function() { setShowHelp(!showHelp); }} style={{ width: 48, height: 48, borderRadius: 24, background: C.purple, color: C.w, border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, boxShadow: "0 4px 16px rgba(99,25,255,0.3)", float: "right" }}>?</button>
    </div>
  );

  // === PLATFORM SELECTOR ===
  var platSelect = (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: C.tp + "80", alignSelf: "center", marginRight: 4 }}>Platforms:</span>
      {PLATS.map(function(p) {
        var on = selPlats.indexOf(p) >= 0;
        var pc = pi(p);
        return <button key={p} onClick={function() { setSelPlats(on ? selPlats.filter(function(x) { return x !== p; }) : selPlats.concat([p])); }} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid " + (on ? pc.b : C.p4), background: on ? pc.bg : C.w, color: on ? pc.b : C.tp + "60", cursor: "pointer" }}>{pc.ic} {p.split(" ")[0]}</button>;
      })}
    </div>
  );

  var header = (
    <div style={sH}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={sL}>xbo</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.th }}>XBO Pulse</div>
          <div style={{ fontSize: 11, color: C.p2 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: !useSample && data ? C.green : C.grey, marginRight: 5, verticalAlign: "middle" }}></span>
            {!useSample && data && data.lastUpdate ? "Live - " + new Date(data.lastUpdate).toLocaleTimeString() : "Sample data - click Refresh for live"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button disabled={ld} onClick={function() { doRefresh("all"); }} style={Object.assign({}, sB, ld ? { opacity: 0.5 } : {})}>{ld && lw === "all" ? "Scanning..." : "Refresh All"}</button>
      </div>
    </div>
  );

  var tabBar = (
    <div style={{ display: "flex", background: C.w, borderBottom: "1px solid " + C.p4, padding: "0 20px", overflowX: "auto" }}>
      {TABS.map(function(t) {
        var on = tab === t.id;
        return <div key={t.id} onClick={function() { setTab(t.id); }} style={{ padding: "12px 14px", fontSize: 12, fontWeight: on ? 600 : 500, whiteSpace: "nowrap", color: on ? C.purple : C.tp + "80", borderBottom: on ? "2px solid " + C.purple : "2px solid transparent", cursor: "pointer" }}>{t.l}{t.id === "saved" && saved.length > 0 ? " (" + saved.length + ")" : ""}</div>;
      })}
    </div>
  );

  var errBox = err ? <div style={{ background: C.rbg, border: "1px solid " + C.red + "40", borderRadius: 10, padding: 14, fontSize: 13, color: C.red, margin: "16px 0" }}>{err}</div> : null;
  var searchBar = (
    <div style={Object.assign({}, sK, { display: "flex", gap: 8, alignItems: "center", padding: 14 })}>
      <input value={sq} onChange={function(e) { setSq(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") doSearch(); }} placeholder="Search any topic... (Bitcoin ETF, Solana memecoins, Argentina crypto)" style={{ flex: 1, border: "1px solid " + C.p4, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.tp, outline: "none", fontFamily: "inherit" }} />
      <button disabled={gl} onClick={doSearch} style={Object.assign({}, sB, { whiteSpace: "nowrap" }, gl ? { opacity: 0.5 } : {})}>{gl ? "..." : "Search + Generate"}</button>
    </div>
  );

  function renderPC(post, i, pfx) {
    var idx = pfx + "-" + i;
    var isCp = copied[idx]; var isEd = eIdx === idx; var pc = pi(post.platform); var plr = post.pillar;
    return (
      <div key={idx} style={{ background: C.w, borderLeft: "3px solid " + pc.b, borderRadius: "0 12px 12px 0", border: "1px solid " + C.p4, borderLeftColor: pc.b, borderLeftWidth: 3, padding: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: pc.b }}>{pc.lb}</span>
            <span style={{ fontSize: 10, color: C.tp + "80", background: C.pbg, padding: "2px 8px", borderRadius: 4 }}>{post.tone}</span>
            {plr ? <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: (pillarC[plr] || C.grey) + "18", color: pillarC[plr] || C.grey, fontWeight: 600 }}>{plr}</span> : null}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={function() { cpTxt(isEd ? eTxt : post.content, idx); }} style={Object.assign({}, sBs, isCp ? { background: C.green, color: C.w, borderColor: C.green } : {})}>{isCp ? "Copied!" : "Copy"}</button>
            <button onClick={function() { if (isEd) { post.content = eTxt; setEIdx(null); } else { setEIdx(idx); setETxt(post.content); } }} style={sBs}>{isEd ? "Save" : "Edit"}</button>
          </div>
        </div>
        {isEd ? <textarea value={eTxt} onChange={function(e) { setETxt(e.target.value); }} style={{ width: "100%", border: "1px solid " + C.p3, borderRadius: 10, padding: 12, fontSize: 13, color: C.tp, lineHeight: 1.6, minHeight: 80, fontFamily: "inherit", resize: "vertical" }} />
          : <div style={{ fontSize: 14, color: C.tp, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{post.content}</div>}
        {(post.hashtags || []).length > 0 ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>{post.hashtags.map(function(h, j) { return <span key={j} style={{ fontSize: 11, color: C.purple, background: C.p3, padding: "2px 6px", borderRadius: 4 }}>#{h}</span>; })}</div> : null}
        {post.engagement_tip ? <div style={{ fontSize: 12, color: C.tp + "80", marginTop: 8, fontStyle: "italic", background: C.pbg, padding: "6px 10px", borderRadius: 8 }}>Tip: {post.engagement_tip}</div> : null}
        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={function() { doRetone(post, "professional"); }} style={Object.assign({}, sBs, { color: C.p2 })} disabled={gl}>Pro</button>
          <button onClick={function() { doRetone(post, "casual"); }} style={Object.assign({}, sBs, { color: C.blue })} disabled={gl}>Casual</button>
          <button onClick={function() { doRetone(post, "bold hot take"); }} style={Object.assign({}, sBs, { color: C.red })} disabled={gl}>Spicy</button>
          <span style={{ width: 1, background: C.p4, margin: "0 2px" }}></span>
          {PILLARS.map(function(p) { return <button key={p} onClick={function() { saveP(post, p); }} style={Object.assign({}, sBs, { color: pillarC[p], fontSize: 9 })}>{p.split("/")[0]}</button>; })}
          <span style={{ width: 1, background: C.p4, margin: "0 2px" }}></span>
          {DAYS.slice(0, 5).map(function(d) { return <button key={d} onClick={function() { addCal(post, d); }} style={Object.assign({}, sBs, { fontSize: 9, color: C.p2 })}>{d.substring(0, 3)}</button>; })}
        </div>
      </div>
    );
  }

  var D = getD();

  // === BRIEFING ===
  if (tab === "briefing") {
    var trends = D.trends || [];
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>{searchBar}{platSelect}
      {trends.length > 0 ? (
        <div style={{ background: "linear-gradient(135deg, " + C.purple + ", " + C.p2 + ")", borderRadius: 16, padding: "22px 26px", marginBottom: 22, color: C.w }}>
          <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Market Mood</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{D.market_mood || "Analyzing..."}</div>
        </div>
      ) : null}
      {errBox}
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Trending ({trends.length})</div>
      {trends.map(function(t, i) {
        var hc = hs(t.heat);
        return (<div key={i} style={sK}>
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: hc.bg, color: hc.c }}>{hc.l}</span>
                <span style={{ fontSize: 11, color: C.tp + "70" }}>{t.category}</span>
                {t.source ? <span style={{ fontSize: 10, color: C.tp + "50" }}>via {t.source}</span> : null}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.th, marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: C.tp + "90", lineHeight: 1.55 }}>{t.summary}</div>
            </div>
            <button disabled={gl} onClick={function() { doGenTrend(t); }} style={{ padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, color: C.purple, background: C.p3, border: "1px solid " + C.p4, cursor: "pointer", whiteSpace: "nowrap" }}>{gl ? "..." : "Generate"}</button>
          </div>
        </div>);
      })}
    </div>{helpBtn}</div>);
  }

  // === DRAFTS ===
  if (tab === "drafts") {
    var posts = gp || D.posts || [];
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>{searchBar}{platSelect}
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Drafts ({posts.length})</div>
      {errBox}
      {posts.length === 0 ? <div style={Object.assign({}, sK, { textAlign: "center", color: C.tp + "70", padding: 36 })}>Search a topic to generate drafts.</div> : null}
      {posts.map(function(p, i) { return renderPC(p, i, "d"); })}
    </div>{helpBtn}</div>);
  }

  // === SAVED ===
  if (tab === "saved") {
    var gr = {};
    for (var i = 0; i < saved.length; i++) { var p = saved[i].pillar || "Other"; if (!gr[p]) gr[p] = []; gr[p].push(saved[i]); }
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Saved Library ({saved.length})</div>
      {saved.length === 0 ? <div style={Object.assign({}, sK, { textAlign: "center", color: C.tp + "70", padding: 36 })}>Save posts from Drafts using pillar buttons.</div> : null}
      {PILLARS.map(function(pl) { var ps = gr[pl] || []; if (!ps.length) return null; return (<div key={pl} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: pillarC[pl] }}></span><span style={{ fontSize: 14, fontWeight: 600, color: C.th }}>{pl} ({ps.length})</span></div>
        {ps.map(function(p, j) { return renderPC(p, j, "s-" + pl); })}
      </div>); })}
    </div>{helpBtn}</div>);
  }

  // === CALENDAR ===
  if (tab === "calendar") {
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.th }}>Weekly Calendar</div>
        <button disabled={ld} onClick={function() { doRefresh("calendar"); }} style={sBG}>{ld && lw === "calendar" ? "Planning..." : "Auto-Generate"}</button>
      </div>{errBox}
      {DAYS.map(function(day) {
        var ps = calP[day] || [];
        return (<div key={day} style={Object.assign({}, sK, { padding: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ps.length > 0 ? 10 : 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.th }}>{day}</div>
            <span style={{ fontSize: 11, color: C.tp + "60" }}>{ps.length} posts</span>
          </div>
          {ps.map(function(p, j) {
            var pc = pi(p.platform);
            return (<div key={j} style={{ background: C.pbg, borderRadius: 10, padding: 12, marginBottom: 6, borderLeft: "3px solid " + pc.b }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: pc.b }}>{pc.lb}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={function() { cpTxt(p.content, "c-" + day + "-" + j); }} style={Object.assign({}, sBs, copied["c-" + day + "-" + j] ? { background: C.green, color: C.w } : {})}>{copied["c-" + day + "-" + j] ? "Copied!" : "Copy"}</button>
                  <button onClick={function() { markPosted(p); }} style={Object.assign({}, sBs, { color: C.green })}>Posted</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.tp, lineHeight: 1.5 }}>{p.content}</div>
            </div>);
          })}
          {ps.length === 0 ? <div style={{ fontSize: 12, color: C.tp + "40", fontStyle: "italic" }}>Add posts from Drafts</div> : null}
        </div>);
      })}
    </div>{helpBtn}</div>);
  }

  // === RESEARCH ===
  if (tab === "research") {
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Research</div>
      <div style={Object.assign({}, sK, { padding: 16 })}>
        <div style={{ fontSize: 13, color: C.tp + "80", marginBottom: 10 }}>Research any competitor, influencer, website, or topic.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={resQ} onChange={function(e) { setResQ(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") doResearch(); }} placeholder="e.g. Binance latest campaign, @ZachXBT, Solana ecosystem..." style={{ flex: 1, border: "1px solid " + C.p4, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.tp, fontFamily: "inherit" }} />
          <button disabled={resLd} onClick={doResearch} style={Object.assign({}, sB, resLd ? { opacity: 0.5 } : {})}>{resLd ? "..." : "Research"}</button>
        </div>
      </div>
      {errBox}
      {resFin ? (<div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.th, margin: "16px 0 10px" }}>Findings ({resFin.length})</div>
        {resFin.map(function(f, i) { return (<div key={i} style={sK}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.th, marginBottom: 4 }}>{f.title}</div>
          <div style={{ fontSize: 13, color: C.tp + "90", lineHeight: 1.55, marginBottom: 6 }}>{f.summary}</div>
          {f.source ? <div style={{ fontSize: 11, color: C.purple }}>Source: {f.source}</div> : null}
          {f.relevance ? <div style={{ fontSize: 11, color: C.tp + "60", marginTop: 4 }}>Relevance: {f.relevance}</div> : null}
        </div>); })}
      </div>) : (
        <div style={Object.assign({}, sK, { marginTop: 14 })}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 8 }}>Quick Research Ideas</div>
          {["Binance latest marketing", "Coinbase social strategy", "@ZachXBT latest thread", "Solana ecosystem growth", "Crypto regulation EU 2026", "Bitcoin ETF institutional flows"].map(function(q) {
            return <button key={q} onClick={function() { setResQ(q); }} style={Object.assign({}, sBG, { marginRight: 6, marginBottom: 6, fontSize: 11 })}>{q}</button>;
          })}
        </div>
      )}
    </div>{helpBtn}</div>);
  }

  // === REPLIES ===
  if (tab === "replies") {
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Engagement Replies</div>
      <div style={Object.assign({}, sK, { padding: 16 })}>
        <div style={{ fontSize: 13, color: C.tp + "80", marginBottom: 10 }}>Paste a tweet or topic for a smart reply from XBO.com.</div>
        <textarea value={rIn} onChange={function(e) { setRIn(e.target.value); }} placeholder="Paste tweet or describe the conversation..." style={{ width: "100%", border: "1px solid " + C.p4, borderRadius: 10, padding: 14, fontSize: 13, minHeight: 80, fontFamily: "inherit", resize: "vertical", marginBottom: 12, color: C.tp }} />
        {platSelect}
        <button disabled={rLd} onClick={doReply} style={Object.assign({}, sB, rLd ? { opacity: 0.5 } : {})}>{rLd ? "Generating..." : "Generate Reply"}</button>
      </div>
      {errBox}
      {rRes ? (<div>{rRes.map(function(r, i) { return renderPC(r, i, "rp"); })}</div>) : null}
    </div>{helpBtn}</div>);
  }

  // === TRACKER ===
  if (tab === "tracker") {
    var bP = {}, bPl = {};
    for (var i = 0; i < posted.length; i++) { var p = posted[i].platform || "?"; var pl = posted[i].pillar || "?"; bP[p] = (bP[p] || 0) + 1; bPl[pl] = (bPl[pl] || 0) + 1; }
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 16 }}>Performance Tracker</div>
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        {[{ n: posted.length, l: "Published", c: C.purple }, { n: saved.length, l: "Saved", c: C.green }, { n: Object.keys(bP).length, l: "Platforms", c: C.blue }].map(function(s) {
          return <div key={s.l} style={Object.assign({}, sK, { flex: 1, minWidth: 120, textAlign: "center", padding: 24 })}><div style={{ fontSize: 32, fontWeight: 700, color: s.c }}>{s.n}</div><div style={{ fontSize: 12, color: C.tp + "80" }}>{s.l}</div></div>;
        })}
      </div>
      {Object.keys(bP).length > 0 ? (<div style={Object.assign({}, sK, { marginBottom: 16 })}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 12 }}>By Platform</div>
        {Object.keys(bP).map(function(p) { var pc = pi(p); var pct = Math.round((bP[p] / posted.length) * 100); return (<div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600, minWidth: 80 }}>{p}</span><div style={{ flex: 1, background: C.pbg, borderRadius: 6, height: 22 }}><div style={{ width: pct + "%", background: pc.b, borderRadius: 6, height: 22, minWidth: 20 }}></div></div><span style={{ fontSize: 12, color: C.tp + "80", minWidth: 24 }}>{bP[p]}</span></div>); })}
      </div>) : null}
      {posted.length === 0 ? <div style={Object.assign({}, sK, { textAlign: "center", color: C.tp + "70", padding: 30 })}>Mark posts as Posted from Calendar to start tracking.</div> : null}
    </div>{helpBtn}</div>);
  }

  // === ACTIVITY ===
  if (tab === "activity") {
    return (<div style={sP}>{tourOverlay}{header}{tabBar}<div style={sC}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 16 }}>Activity Log</div>
      <div style={sK}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 10 }}>Release Notes</div>
        {RELEASE_NOTES.map(function(r, i) {
          return (<div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < RELEASE_NOTES.length - 1 ? "1px solid " + C.p4 : "none" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.purple, background: C.p3, padding: "2px 8px", borderRadius: 4 }}>v{r.ver}</span>
              <span style={{ fontSize: 11, color: C.tp + "60" }}>{r.date}</span>
            </div>
            <div style={{ fontSize: 12, color: C.tp + "CC", lineHeight: 1.5 }}>{r.notes}</div>
          </div>);
        })}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 10, marginTop: 16 }}>Recent Actions</div>
      {actLog.length === 0 ? <div style={Object.assign({}, sK, { textAlign: "center", color: C.tp + "70", padding: 30 })}>Actions will appear here as you use the dashboard.</div> : null}
      {actLog.map(function(a, i) {
        return (<div key={i} style={Object.assign({}, sK, { padding: 12, display: "flex", justifyContent: "space-between" })}>
          <span style={{ fontSize: 12, color: C.tp }}>{a.action}</span>
          <span style={{ fontSize: 10, color: C.tp + "60" }}>{a.time}</span>
        </div>);
      })}
    </div>{helpBtn}</div>);
  }

  return <div style={sP}>{tourOverlay}{header}{tabBar}{helpBtn}</div>;
}
