"use client";
import { useState, useEffect, useRef } from "react";

// === BRAND COLORS ===
var C = {
  purple: "#6319FF",
  p2: "#3B0F99",
  p3: "#E5DDF9",
  p4: "#CDC6ED",
  pbg: "#F4F3F8",
  th: "#270A66",
  tp: "#140533",
  green: "#49B47A",
  gbg: "#E3F9F4",
  blue: "#0092D0",
  bbg: "#DCE9F4",
  red: "#FD3B5E",
  rbg: "#FDEEEE",
  grey: "#C4C4C4",
  w: "#FFFFFF",
  orange: "#D97706"
};

// === CONSTANTS ===
var PILLARS = ["Market Commentary", "Product Education", "Community/Memes", "Regulation", "LATAM/Football"];
var PLATS = ["X", "LinkedIn", "Telegram", "Instagram"];
var CHAR_LIM = { "X": 280, "LinkedIn": 3000, "Instagram": 2200, "Telegram": 4096 };
var PN_LIM = { title: 50, body: 120 };
var pillarC = {
  "Market Commentary": C.blue,
  "Product Education": C.green,
  "Community/Memes": C.orange,
  "Regulation": C.red,
  "LATAM/Football": C.purple
};
var STATUSES = ["Draft", "Review", "Approved", "Scheduled", "Posted"];
var STATUS_C = {
  "Draft": C.grey,
  "Review": C.orange,
  "Approved": C.green,
  "Scheduled": C.blue,
  "Posted": C.purple
};
var CONTENT_TYPES = ["Social Post", "Push Notification"];
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var DSHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// === TEMPLATES ===
var TEMPLATES = [
  {
    id: "weekly_x",
    name: "Weekly X Plan",
    desc: "5 posts for X this week across all pillars",
    icon: "X",
    prompt: "Create 5 X posts for XBO.com this week. Mix: market commentary, product education, community, trending news. Under 280 chars each, hook-first, clear CTA."
  },
  {
    id: "feature_launch",
    name: "Feature Launch Pack",
    desc: "Social + push notifications for a new feature",
    icon: "🚀",
    prompt: "Create launch content for XBO.com: 2 X posts, 2 LinkedIn posts, 2 Telegram messages, and 2 push notifications. Announce the feature, explain value, drive action."
  },
  {
    id: "earn_promo",
    name: "Earn Promotion",
    desc: "Promote XBO Earn rates across platforms",
    icon: "%",
    prompt: "Create promotional content for XBO Earn: up to 15% APR on stablecoins, daily compounding, flexible terms, custodial protection by Fireblocks. Include specific numbers and CTA."
  },
  {
    id: "event_reaction",
    name: "Market Event Reaction",
    desc: "Quick-turn content for breaking news",
    icon: "⚡",
    prompt: "Create reactive content for XBO.com responding to this market event. Be timely, add XBO's perspective, include product CTA."
  },
  {
    id: "competitor_resp",
    name: "Competitor Response",
    desc: "Position XBO against competitor moves",
    icon: "🎯",
    prompt: "Create content positioning XBO.com favorably. Focus on: EU regulation, LATAM/football, better affiliate rates, award-winning CryptoPayX. Don't name competitors."
  },
  {
    id: "argentina",
    name: "Partnership Spotlight",
    desc: "Argentina Football Team content",
    icon: "⚽",
    prompt: "Create content celebrating XBO.com's Argentina National Football Team sponsorship. Connect sports passion with crypto. Target LATAM audience."
  }
];

// === RESEARCH SOURCES ===
var RESEARCH_SOURCES = {
  "Publications": [
    "CoinDesk", "The Block", "CoinTelegraph", "Decrypt", "BeInCrypto",
    "DL News", "Blockworks", "The Defiant", "Unchained", "CryptoSlate",
    "Bitcoin Magazine", "Protos"
  ],
  "Data/Analytics": [
    "Glassnode", "Dune Analytics", "DefiLlama", "Token Terminal",
    "Messari", "Nansen", "CoinGecko", "CoinMarketCap"
  ],
  "X News": [
    "@WuBlockchain", "@tier10k", "@DeItaone", "@unusual_whales",
    "@lookonchain", "@EmberCN", "@ai_9684xtpa", "@0xScope"
  ],
  "X Commentary": [
    "@ZachXBT", "@coaboroiu", "@AltcoinGordon", "@CryptoHayes",
    "@inversebrah", "@Rewkang", "@CryptoCobain", "@lightcrypto"
  ],
  "X Institutional": [
    "@BitMEXResearch", "@ellaboratecap", "@nic__carter", "@100trillionUSD"
  ],
  "Regulatory": [
    "@EleanorTerrett", "@stephtoub", "@jabornahmad"
  ],
  "LATAM": [
    "@CryptoArgentina", "@BeInCryptoEs", "@CoinTelegraphES"
  ]
};

// === RELEASE NOTES ===
var RELEASE_NOTES = [
  { ver: "1.0", date: "Mar 24, 2026", notes: "Initial launch." },
  { ver: "1.1", date: "Mar 24, 2026", notes: "Branding, platform generation, research, replies, pillars, saved library." },
  { ver: "1.2", date: "Mar 24, 2026", notes: "Login, tour, sample data, activity log." },
  { ver: "1.3", date: "Mar 24, 2026", notes: "Soft delete, undo toast, analytics, platform rename." },
  { ver: "1.4", date: "Mar 26, 2026", notes: "Calendar month/week/day views, briefing search, schedule picker, activity panel." },
  {
    ver: "1.5",
    date: "Mar 27, 2026",
    notes: "Brand knowledge base. Smart command briefing. Content templates. Push notifications. Status workflow. Asset notes. Research source library with custom sources. Removed market mood."
  }
];

// === TOUR ===
var TOUR_STEPS = [
  {
    title: "Welcome to XBO Pulse",
    desc: "Your AI-powered content command center — powered by XBO's full brand knowledge base."
  },
  {
    title: "Smart Briefing",
    desc: "Type any instruction: 'Create 5 posts for X this week', 'Write a push notification about Earn', or paste a URL. The system routes intelligently."
  },
  {
    title: "Content Templates",
    desc: "Pre-built templates for recurring needs: weekly plans, feature launches, earn promos, event reactions, and more."
  },
  {
    title: "Drafts + Status",
    desc: "All generated content with status workflow: Draft → Review → Approved → Scheduled → Posted. Add asset notes for design handoff."
  },
  {
    title: "Calendar Views",
    desc: "Month/Week/Day views. Coverage score. Navigate and drill into any day."
  },
  {
    title: "Research + Tracker",
    desc: "Research any topic with a curated source library. Track publishing stats and analytics."
  }
];

// === SAMPLE DATA ===
var SAMPLE = {
  trends: [
    {
      title: "Bitcoin Tests $90K Resistance",
      summary: "Bitcoin approaching $90K with strong institutional ETF inflows.",
      heat: "hot",
      category: "Market",
      source: "CoinDesk"
    },
    {
      title: "Ethereum L2 TVL Hits $50B",
      summary: "Total value locked across L2 networks surpassed $50B, led by Arbitrum and Base.",
      heat: "rising",
      category: "DeFi",
      source: "The Block"
    },
    {
      title: "SEC Approves New Crypto ETFs",
      summary: "Three new altcoin ETFs approved, expanding regulated crypto investment.",
      heat: "hot",
      category: "Regulation",
      source: "CoinTelegraph"
    },
    {
      title: "Argentina Crypto Adoption Surges",
      summary: "Record P2P volumes in Argentina as inflation drives stablecoin adoption.",
      heat: "rising",
      category: "LATAM",
      source: "BeInCrypto"
    }
  ],
  posts: [
    {
      platform: "X",
      tone: "Bold",
      content: "Bitcoin at $90K isn't the top. It's the starting line.\n\nInstitutions are just warming up.\n\nTrade BTC on XBO.com",
      contentType: "Social Post",
      status: "Draft"
    },
    {
      platform: "LinkedIn",
      tone: "Professional",
      content: "The SEC just approved three new altcoin ETFs.\n\nAt XBO.com, we've been preparing for this shift. As institutional access expands, traditional finance and crypto continue to converge.\n\nWhat does this mean for your portfolio?",
      contentType: "Social Post",
      status: "Draft"
    },
    {
      platform: "Telegram",
      tone: "Community",
      content: "BTC pushing $90K and the vibes are immaculate. Who's watching? Drop predictions below.\n\nTrade BTC with up to 100x leverage on XBO.com",
      contentType: "Social Post",
      status: "Draft"
    }
  ]
};

// === HELPER FUNCTIONS ===

function pi(p) {
  var k = (p || "").toLowerCase();
  if (k === "x" || k.indexOf("twitter") >= 0) {
    return { b: "#1d9bf0", bg: "#EBF5FF", ic: "X", lb: "X" };
  }
  if (k.indexOf("linkedin") >= 0) {
    return { b: "#0a66c2", bg: "#EEF3FF", ic: "in", lb: "LinkedIn" };
  }
  if (k.indexOf("telegram") >= 0) {
    return { b: C.blue, bg: C.bbg, ic: "TG", lb: "Telegram" };
  }
  return { b: "#C13584", bg: "#FDF2F8", ic: "IG", lb: "Instagram" };
}

function migPlat(p) {
  if (p && p.platform === "X Twitter") {
    p.platform = "X";
  }
  return p;
}

function hs(h) {
  if (h === "hot") return { bg: C.rbg, c: C.red, l: "HOT" };
  if (h === "rising") return { bg: "#FEF9C3", c: "#CA8A04", l: "RISING" };
  return { bg: "#FFF3E0", c: "#EA580C", l: "WARM" };
}

// === DATE HELPERS ===

function dk(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function isSame(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtD(d) {
  return MONS[d.getMonth()] + " " + d.getDate();
}

function fmtFull(d) {
  return DSHORT[(d.getDay() + 6) % 7] + ", " + MONTHS[d.getMonth()] + " " + d.getDate();
}

function isToday(d) {
  return isSame(d, new Date());
}

function getWeek(d) {
  var dd = new Date(d);
  var dow = (dd.getDay() + 6) % 7;
  var mon = new Date(dd);
  mon.setDate(dd.getDate() - dow);
  var days = [];
  for (var i = 0; i < 7; i++) {
    var nd = new Date(mon);
    nd.setDate(mon.getDate() + i);
    days.push(nd);
  }
  return days;
}

function getMonthGrid(y, m) {
  var first = new Date(y, m, 1);
  var last = new Date(y, m + 1, 0);
  var off = (first.getDay() + 6) % 7;
  var total = Math.ceil((off + last.getDate()) / 7) * 7;
  var cells = [];
  for (var i = 0; i < total; i++) {
    cells.push(new Date(y, m, 1 - off + i));
  }
  return cells;
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================

export default function App() {

  // === AUTH STATE ===
  var _a = useState(false), authed = _a[0], setAuthed = _a[1];
  var _em = useState(""), email = _em[0], setEmail = _em[1];
  var _pw = useState(""), pass = _pw[0], setPass = _pw[1];
  var _le = useState(""), loginErr = _le[0], setLoginErr = _le[1];

  // === CORE STATE ===
  var _tour = useState(-1), tourStep = _tour[0], setTourStep = _tour[1];
  var _tab = useState("briefing"), tab = _tab[0], setTab = _tab[1];
  var _data = useState(null), data = _data[0], setData = _data[1];
  var _ld = useState(false), ld = _ld[0], setLd = _ld[1];
  var _lw = useState(""), lw = _lw[0], setLw = _lw[1];
  var _err = useState(null), err = _err[0], setErr = _err[1];
  var _useSample = useState(true), useSample = _useSample[0], setUseSample = _useSample[1];

  // === BRIEFING STATE ===
  var _sq = useState(""), sq = _sq[0], setSq = _sq[1];
  var _bRes = useState(null), bRes = _bRes[0], setBRes = _bRes[1];
  var _bLd = useState(false), bLd = _bLd[0], setBLd = _bLd[1];
  var _selP = useState(["X", "LinkedIn", "Telegram", "Instagram"]), selPlats = _selP[0], setSelPlats = _selP[1];
  var _cType = useState("Social Post"), cType = _cType[0], setCType = _cType[1];

  // === DRAFTS STATE ===
  var _gp = useState(null), gp = _gp[0], setGp = _gp[1];
  var _gl = useState(false), gl = _gl[0], setGl = _gl[1];
  var _cp = useState({}), copied = _cp[0], setCp = _cp[1];
  var _ei = useState(null), eIdx = _ei[0], setEIdx = _ei[1];
  var _et = useState(""), eTxt = _et[0], setETxt = _et[1];
  var _dq = useState(""), dq = _dq[0], setDq = _dq[1];

  // === SCHEDULE PICKER STATE ===
  var _sch = useState(null), schIdx = _sch[0], setSchIdx = _sch[1];
  var _schP = useState("X"), schPlat = _schP[0], setSchPlat = _schP[1];
  var _schD = useState(new Date()), schDate = _schD[0], setSchDate = _schD[1];
  var _schW = useState(new Date()), schWeekRef = _schW[0], setSchWeekRef = _schW[1];

  // === SAVED STATE ===
  var _sp = useState([]), saved = _sp[0], setSaved = _sp[1];

  // === CALENDAR STATE ===
  var _cal = useState({}), calP = _cal[0], setCalP = _cal[1];
  var _calV = useState("week"), calView = _calV[0], setCalView = _calV[1];
  var _calRef = useState(new Date()), calRef = _calRef[0], setCalRef = _calRef[1];
  var _calSel = useState(new Date()), calSel = _calSel[0], setCalSel = _calSel[1];

  // === POSTED / TRACKER STATE ===
  var _pl = useState([]), posted = _pl[0], setPosted = _pl[1];
  var _metrics = useState({}), metrics = _metrics[0], setMetrics = _metrics[1];
  var _metEdit = useState(null), metEdit = _metEdit[0], setMetEdit = _metEdit[1];

  // === RESEARCH STATE ===
  var _rq = useState(""), resQ = _rq[0], setResQ = _rq[1];
  var _rf = useState(null), resFin = _rf[0], setResFin = _rf[1];
  var _rfl = useState(false), resLd = _rfl[0], setResLd = _rfl[1];
  var _csrc = useState([]), customSrc = _csrc[0], setCustomSrc = _csrc[1];
  var _csIn = useState(""), csIn = _csIn[0], setCsIn = _csIn[1];

  // === REPLIES STATE ===
  var _ri = useState(""), rIn = _ri[0], setRIn = _ri[1];
  var _rr = useState(null), rRes = _rr[0], setRRes = _rr[1];
  var _rl = useState(false), rLd = _rl[0], setRLd = _rl[1];

  // === UI STATE ===
  var _help = useState(false), showHelp = _help[0], setShowHelp = _help[1];
  var _showAct = useState(false), showAct = _showAct[0], setShowAct = _showAct[1];
  var _log = useState([]), actLog = _log[0], setActLog = _log[1];
  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];
  var toastTimer = useRef(null);

  // === KNOWLEDGE BASE STATE ===
  var _kb = useState(null), kb = _kb[0], setKb = _kb[1];

  // === EFFECTS ===
  useEffect(function () {
    if (authed) {
      fetchData();
      fetchKB();
    }
  }, [authed]);

  useEffect(function () {
    return function () {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // === CORE FUNCTIONS ===

  function addLog(action) {
    setActLog(function (p) {
      return [{ action: action, time: new Date().toLocaleString() }].concat(p).slice(0, 50);
    });
  }

  function fetchData() {
    fetch("/api/data")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.lastUpdate) {
          setData(d);
          setUseSample(false);
        }
      })
      .catch(function () {});
  }

  function fetchKB() {
    fetch("/api/knowledge")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d) setKb(d);
      })
      .catch(function () {});
  }

  function getD() {
    return useSample ? SAMPLE : (data || SAMPLE);
  }

  // === TOAST FUNCTIONS ===

  function showToast(msg, undoFn) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg: msg, undoFn: undoFn });
    toastTimer.current = setTimeout(function () {
      setToast(null);
    }, 5000);
  }

  function dismissToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }

  function undoToast() {
    if (toast && toast.undoFn) toast.undoFn();
    dismissToast();
  }

  // ============================================================
  // SMART GENERATE (briefing command center)
  // ============================================================

  function doSmartGen(prompt) {
    if (!prompt.trim()) return;
    setBLd(true);
    setErr(null);
    addLog("Command: " + prompt.substring(0, 60));

    var isPn = cType === "Push Notification" ||
      prompt.toLowerCase().indexOf("push notif") >= 0 ||
      prompt.toLowerCase().indexOf(" pn ") >= 0;

    var sysCtx = "You are XBO Pulse, the content AI for XBO.com. " +
      (kb ? "Use this brand knowledge: " + JSON.stringify(kb).substring(0, 6000) : "") +
      " Content type: " +
      (isPn ? "Push Notification (title max 50 chars, body max 120 chars)" : "Social media posts for: " + selPlats.join(", ")) +
      ". Brand voice: punchy, direct, human-sounding. No em dashes. No AI phrasing. Include specific product numbers. Always include CTA.";

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: prompt,
        platforms: isPn ? ["Push Notification"] : selPlats,
        systemContext: sysCtx,
        contentType: isPn ? "push_notification" : "social"
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.posts) {
          var posts = d.posts.map(function (p) {
            migPlat(p);
            p.contentType = isPn ? "Push Notification" : "Social Post";
            p.status = "Draft";
            return p;
          });
          setGp(posts);
          setTab("drafts");
          setUseSample(false);
        } else if (d.error) {
          setErr(d.error);
        }
        setBLd(false);
      })
      .catch(function () {
        setErr("Generation failed");
        setBLd(false);
      });
  }

  // ============================================================
  // BRIEFING ACTIONS
  // ============================================================

  function doRefreshTrends() {
    setLd(true);
    setLw("trends");
    setErr(null);
    addLog("Refreshed trends");

    fetch("/api/scan?section=trends&platforms=" + selPlats.join(","))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) setErr(d.error);
        else { fetchData(); setUseSample(false); }
        setLd(false);
      })
      .catch(function () {
        setErr("Refresh failed");
        setLd(false);
      });
  }

  function doBriefSearch() {
    if (!sq.trim()) return;

    // Detect if user wants to generate content vs search news
    var looksLikeGen = /^(create|write|generate|draft|make)\b/i.test(sq.trim());
    if (looksLikeGen) {
      doSmartGen(sq);
      setSq("");
      return;
    }

    // Otherwise search for trending news
    setBLd(true);
    setBRes(null);
    setErr(null);
    addLog("Search: " + sq);

    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: sq })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.findings) {
          setBRes(d.findings.map(function (f) {
            return {
              title: f.title || "Finding",
              summary: f.summary || "",
              source: f.source || "",
              heat: "rising",
              category: "Search"
            };
          }));
        } else if (d.error) {
          setErr(d.error);
        }
        setBLd(false);
      })
      .catch(function () {
        setErr("Search failed");
        setBLd(false);
      });
  }

  function doGenFromDrafts() {
    if (!dq.trim()) return;
    doSmartGen(dq);
    setDq("");
  }

  // ============================================================
  // CALENDAR ACTIONS
  // ============================================================

  function addCal(post, date, platform) {
    var key = dk(date);
    var p2 = Object.assign({}, migPlat(post));
    if (platform) p2.platform = platform;
    p2.scheduledDate = key;
    p2.status = "Scheduled";
    setCalP(function (p) {
      var u = Object.assign({}, p);
      u[key] = (u[key] || []).concat([p2]);
      return u;
    });
  }

  function delCal(key, idx) {
    var dayPosts = (calP[key] || []).slice();
    var removed = dayPosts[idx];
    dayPosts.splice(idx, 1);
    var updated = Object.assign({}, calP);
    updated[key] = dayPosts;
    setCalP(updated);
    addLog("Deleted from calendar");
    showToast("Deleted", function () {
      var r = Object.assign({}, updated);
      var rp = (r[key] || []).slice();
      rp.splice(idx, 0, removed);
      r[key] = rp;
      setCalP(r);
    });
  }

  function markPosted(post) {
    var p = Object.assign({}, migPlat(post), {
      postedAt: new Date().toLocaleString(),
      status: "Posted"
    });
    setPosted(function (prev) {
      return prev.concat([p]);
    });
    addLog("Marked posted");
    showToast("Marked as posted");
  }

  function confirmSch(postIdx) {
    var posts = gp || getD().posts || [];
    var post = posts[postIdx];
    if (!post) return;
    addCal(post, schDate, schPlat);
    showToast(schPlat + " · " + fmtD(schDate));
    setSchIdx(null);
    addLog("Scheduled to " + fmtD(schDate));
  }

  // ============================================================
  // DELETE HANDLERS
  // ============================================================

  function delDraft(idx) {
    var posts = gp || getD().posts || [];
    var removed = posts[idx];
    var updated = posts.slice();
    updated.splice(idx, 1);
    setGp(updated);
    addLog("Deleted draft");
    showToast("Draft deleted", function () {
      var r = updated.slice();
      r.splice(idx, 0, removed);
      setGp(r);
    });
  }

  function delSaved(sIdx) {
    var removed = saved[sIdx];
    var updated = saved.slice();
    updated.splice(sIdx, 1);
    setSaved(updated);
    addLog("Deleted saved");
    showToast("Saved deleted", function () {
      var r = updated.slice();
      r.splice(sIdx, 0, removed);
      setSaved(r);
    });
  }

  function delPosted(idx) {
    var removed = posted[idx];
    var updated = posted.slice();
    updated.splice(idx, 1);
    setPosted(updated);
    addLog("Deleted posted");
    showToast("Posted deleted", function () {
      var r = updated.slice();
      r.splice(idx, 0, removed);
      setPosted(r);
    });
  }

  // ============================================================
  // STATUS + ASSET NOTES
  // ============================================================

  function setPostStatus(idx, status) {
    var posts = (gp || getD().posts || []).slice();
    if (posts[idx]) {
      posts[idx] = Object.assign({}, posts[idx], { status: status });
      setGp(posts);
      addLog("Status → " + status);
    }
  }

  function setAssetNote(idx, note) {
    var posts = (gp || getD().posts || []).slice();
    if (posts[idx]) {
      posts[idx] = Object.assign({}, posts[idx], { assetNote: note });
      setGp(posts);
    }
  }

  // ============================================================
  // OTHER ACTIONS
  // ============================================================

  function saveP(post, pillar) {
    setSaved(function (p) {
      return p.concat([Object.assign({}, migPlat(post), {
        pillar: pillar,
        savedAt: new Date().toLocaleString()
      })]);
    });
    addLog("Saved: " + pillar);
    showToast("Saved to " + pillar);
  }

  function cpTxt(text, idx) {
    navigator.clipboard.writeText(text);
    var o = {};
    o[idx] = true;
    setCp(function (p) { return Object.assign({}, p, o); });
    setTimeout(function () {
      var o2 = {};
      o2[idx] = false;
      setCp(function (p) { return Object.assign({}, p, o2); });
    }, 2000);
  }

  function setMetric(idx, field, val) {
    setMetrics(function (prev) {
      var u = Object.assign({}, prev);
      var entry = Object.assign({}, u[idx] || {});
      entry[field] = val;
      u[idx] = entry;
      return u;
    });
  }

  // === CALENDAR NAVIGATION ===

  function calNav(dir) {
    var d = new Date(calRef);
    if (calView === "month") d.setMonth(d.getMonth() + dir);
    else if (calView === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCalRef(d);
    if (calView === "day") setCalSel(d);
  }

  function calToday() {
    var t = new Date();
    setCalRef(t);
    setCalSel(t);
  }

  function calCountForDay(d) {
    return (calP[dk(d)] || []).length;
  }

  function calCoverage(weekDays) {
    var c = 0;
    for (var i = 0; i < weekDays.length; i++) {
      if (calCountForDay(weekDays[i]) > 0) c++;
    }
    return c;
  }

  // === REPLIES ===

  function doReply() {
    if (!rIn.trim()) return;
    setRLd(true);
    setRRes(null);
    addLog("Generated reply");

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Write smart reply from XBO.com to: " + rIn,
        platforms: selPlats
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.posts) setRRes(d.posts.map(migPlat));
        setRLd(false);
      })
      .catch(function () { setRLd(false); });
  }

  // === RESEARCH ===

  function doResearch() {
    if (!resQ.trim()) return;
    setResLd(true);
    setResFin(null);
    addLog("Researched: " + resQ);

    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: resQ })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.findings) setResFin(d.findings);
        else if (d.error) setErr(d.error);
        setResLd(false);
      })
      .catch(function () {
        setErr("Research failed");
        setResLd(false);
      });
  }

  function addCustomSrc() {
    if (csIn.trim() && customSrc.indexOf(csIn.trim()) < 0) {
      setCustomSrc(customSrc.concat([csIn.trim()]));
      setCsIn("");
      addLog("Added source: " + csIn);
      showToast("Source added");
    }
  }

  // ============================================================
  // STYLES
  // ============================================================

  var sP = {
    minHeight: "100vh",
    background: C.pbg,
    fontFamily: "'IBM Plex Sans', -apple-system, sans-serif"
  };
  var sH = {
    background: C.w,
    borderBottom: "1px solid " + C.p4,
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50
  };
  var sL = {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: C.purple,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    color: C.w
  };
  var sC = {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "24px 20px",
    paddingBottom: 80
  };
  var sK = {
    background: C.w,
    border: "1px solid " + C.p4,
    borderRadius: 14,
    padding: 20,
    marginBottom: 14
  };
  var sB = {
    padding: "10px 22px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: C.w,
    background: C.purple,
    border: "none",
    cursor: "pointer"
  };
  var sBG = {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    color: C.tp,
    background: C.w,
    border: "1px solid " + C.p4,
    cursor: "pointer"
  };
  var sBs = {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid " + C.p4,
    background: C.w,
    color: C.tp
  };
  var sBDel = {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid " + C.red + "40",
    background: C.rbg,
    color: C.red
  };

  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: C.pbg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.w, borderRadius: 20, padding: 40, maxWidth: 400, width: "100%", textAlign: "center", border: "1px solid " + C.p4 }}>
          <div style={Object.assign({}, sL, { margin: "0 auto 16px", width: 50, height: 50, fontSize: 18 })}>xbo</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.th, marginBottom: 4 }}>XBO Pulse</div>
          <div style={{ fontSize: 13, color: C.tp + "80", marginBottom: 24 }}>Content Command Center</div>
          <input
            value={email}
            onChange={function (e) { setEmail(e.target.value); }}
            placeholder="Email"
            style={{ width: "100%", padding: "12px 14px", border: "1px solid " + C.p4, borderRadius: 10, fontSize: 13, marginBottom: 10, fontFamily: "inherit", color: C.tp }}
          />
          <input
            value={pass}
            onChange={function (e) { setPass(e.target.value); }}
            type="password"
            placeholder="Password"
            onKeyDown={function (e) {
              if (e.key === "Enter") {
                if (email === "admin@xbo.com" && pass === "xbopulse2024") {
                  setAuthed(true);
                  setTourStep(0);
                } else {
                  setLoginErr("Invalid credentials");
                }
              }
            }}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid " + C.p4, borderRadius: 10, fontSize: 13, marginBottom: 10, fontFamily: "inherit", color: C.tp }}
          />
          {loginErr ? <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{loginErr}</div> : null}
          <button
            onClick={function () {
              if (email === "admin@xbo.com" && pass === "xbopulse2024") {
                setAuthed(true);
                setTourStep(0);
              } else {
                setLoginErr("Invalid credentials");
              }
            }}
            style={Object.assign({}, sB, { width: "100%", padding: 14 })}
          >
            Sign In
          </button>
          <div style={{ marginTop: 20, background: C.p3, borderRadius: 10, padding: 14, fontSize: 11, color: C.p2, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Demo Credentials:</div>
            Email: admin@xbo.com<br />
            Password: xbopulse2024
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // TAB BAR + SHARED UI ELEMENTS
  // ============================================================

  var draftCount = (gp || getD().posts || []).length;
  var calTotal = 0;
  Object.keys(calP).forEach(function (k) { calTotal += (calP[k] || []).length; });

  var TABS = [
    { id: "briefing", l: "Briefing" },
    { id: "drafts", l: "Drafts" + (draftCount > 0 ? " (" + draftCount + ")" : "") },
    { id: "saved", l: "Saved" + (saved.length > 0 ? " (" + saved.length + ")" : "") },
    { id: "calendar", l: "Calendar" + (calTotal > 0 ? " (" + calTotal + ")" : "") },
    { id: "research", l: "Research" },
    { id: "replies", l: "Replies" },
    { id: "tracker", l: "Tracker" }
  ];

  // === TOAST ===
  var toastEl = toast ? (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 200, background: C.th, color: C.w, borderRadius: 12,
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 8px 30px rgba(20,5,51,0.35)", fontSize: 13, fontWeight: 500,
      minWidth: 260, maxWidth: "90%"
    }}>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      {toast.undoFn ? (
        <button onClick={undoToast} style={{
          background: C.purple, color: C.w, border: "none", borderRadius: 8,
          padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer"
        }}>Undo</button>
      ) : null}
      <button onClick={dismissToast} style={{
        background: "transparent", color: C.w + "80", border: "none",
        fontSize: 16, cursor: "pointer", padding: "0 4px"
      }}>x</button>
    </div>
  ) : null;

  // === TOUR OVERLAY ===
  var tourOverlay = tourStep >= 0 && tourStep < TOUR_STEPS.length ? (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(20,5,51,0.7)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: C.w, borderRadius: 20, padding: 36, maxWidth: 480, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.purple, fontWeight: 600, marginBottom: 8 }}>
          STEP {tourStep + 1} OF {TOUR_STEPS.length}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.th, marginBottom: 10 }}>
          {TOUR_STEPS[tourStep].title}
        </div>
        <div style={{ fontSize: 14, color: C.tp + "CC", lineHeight: 1.6, marginBottom: 24 }}>
          {TOUR_STEPS[tourStep].desc}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {tourStep > 0 ? (
            <button onClick={function () { setTourStep(tourStep - 1); }} style={sBG}>Back</button>
          ) : null}
          {tourStep < TOUR_STEPS.length - 1 ? (
            <button onClick={function () { setTourStep(tourStep + 1); }} style={sB}>Next</button>
          ) : (
            <button onClick={function () { setTourStep(-1); }} style={sB}>Get Started</button>
          )}
          <button onClick={function () { setTourStep(-1); }} style={Object.assign({}, sBG, { fontSize: 11, color: C.tp + "60" })}>Skip</button>
        </div>
      </div>
    </div>
  ) : null;

  // === FLOATING PANELS (Activity + Help) ===
  var floatingBtns = (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>

      {/* Activity Panel */}
      {showAct ? (
        <div style={{ background: C.w, border: "1px solid " + C.p4, borderRadius: 16, padding: 20, width: 340, maxHeight: 460, overflowY: "auto", boxShadow: "0 8px 30px rgba(99,25,255,0.15)", marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.th }}>Activity Log</div>
            <button onClick={function () { setShowAct(false); }} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: C.tp }}>x</button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 8 }}>Release Notes</div>
          {RELEASE_NOTES.slice().reverse().slice(0, 3).map(function (r, i) {
            return (
              <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid " + C.p4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.p3, padding: "1px 6px", borderRadius: 4, marginRight: 6 }}>v{r.ver}</span>
                <span style={{ fontSize: 10, color: C.tp + "60" }}>{r.date}</span>
                <div style={{ fontSize: 11, color: C.tp + "BB", lineHeight: 1.4, marginTop: 3 }}>{r.notes}</div>
              </div>
            );
          })}

          <div style={{ fontSize: 11, fontWeight: 600, color: C.th, marginTop: 8, marginBottom: 6 }}>Recent Actions</div>
          {actLog.length === 0 ? <div style={{ fontSize: 11, color: C.tp + "60" }}>No actions yet.</div> : null}
          {actLog.slice(0, 15).map(function (a, i) {
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid " + C.p4 + "60" }}>
                <span style={{ fontSize: 11, color: C.tp }}>{a.action}</span>
                <span style={{ fontSize: 9, color: C.tp + "50", whiteSpace: "nowrap", marginLeft: 8 }}>{a.time}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Help Panel */}
      {showHelp ? (
        <div style={{ background: C.w, border: "1px solid " + C.p4, borderRadius: 16, padding: 24, width: 320, maxHeight: 460, overflowY: "auto", boxShadow: "0 8px 30px rgba(99,25,255,0.15)", marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.th }}>How to Use</div>
            <button onClick={function () { setShowHelp(false); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.tp }}>x</button>
          </div>
          <div style={{ fontSize: 12, color: C.tp + "CC", lineHeight: 1.7 }}>
            {[
              ["1. Briefing", "Type any instruction: generate posts, search news, or use a template."],
              ["2. Drafts", "Edit content with character counter. Set status. Add asset notes. Schedule to calendar."],
              ["3. Calendar", "Month/Week/Day views with coverage score."],
              ["4. Research", "Curated sources + add your own topics, links, or accounts."],
              ["5. Tracker", "Publishing stats and per-post analytics."]
            ].map(function (item) {
              return (
                <div key={item[0]}>
                  <div style={{ fontWeight: 600, color: C.purple, marginBottom: 3 }}>{item[0]}</div>
                  <div style={{ marginBottom: 10 }}>{item[1]}</div>
                </div>
              );
            })}
          </div>
          <button onClick={function () { setTourStep(0); setShowHelp(false); }} style={Object.assign({}, sB, { width: "100%", marginTop: 8, fontSize: 12 })}>Replay Tour</button>
        </div>
      ) : null}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={function () { setShowAct(!showAct); setShowHelp(false); }}
          style={{ width: 44, height: 44, borderRadius: 22, background: showAct ? C.th : C.p2, color: C.w, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(99,25,255,0.2)" }}
          title="Activity"
        >Log</button>
        <button
          onClick={function () { setShowHelp(!showHelp); setShowAct(false); }}
          style={{ width: 44, height: 44, borderRadius: 22, background: C.purple, color: C.w, border: "none", cursor: "pointer", fontSize: 20, fontWeight: 700, boxShadow: "0 4px 16px rgba(99,25,255,0.3)" }}
          title="Help"
        >?</button>
      </div>
    </div>
  );

  // === PLATFORM + CONTENT TYPE SELECTOR ===
  var platSelect = (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: C.tp + "80", marginRight: 4 }}>Platforms:</span>
      {PLATS.map(function (p) {
        var on = selPlats.indexOf(p) >= 0;
        var pc = pi(p);
        return (
          <button
            key={p}
            onClick={function () { setSelPlats(on ? selPlats.filter(function (x) { return x !== p; }) : selPlats.concat([p])); }}
            style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid " + (on ? pc.b : C.p4), background: on ? pc.bg : C.w, color: on ? pc.b : C.tp + "60", cursor: "pointer" }}
          >{pc.ic} {p}</button>
        );
      })}
      <span style={{ width: 1, height: 20, background: C.p4, margin: "0 4px" }}></span>
      {CONTENT_TYPES.map(function (ct) {
        var on = cType === ct;
        return (
          <button
            key={ct}
            onClick={function () { setCType(ct); }}
            style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid " + (on ? C.purple : C.p4), background: on ? C.p3 : C.w, color: on ? C.purple : C.tp + "60", cursor: "pointer" }}
          >{ct}</button>
        );
      })}
    </div>
  );

  // === HEADER ===
  var header = (
    <div style={sH}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={sL}>xbo</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.th }}>XBO Pulse</div>
          <div style={{ fontSize: 11, color: C.p2 }}>
            <span style={{
              display: "inline-block", width: 7, height: 7, borderRadius: "50%",
              background: !useSample && data ? C.green : kb ? C.orange : C.grey,
              marginRight: 5, verticalAlign: "middle"
            }}></span>
            {!useSample && data ? "Live" : "Sample"}
            {kb ? " · KB loaded" : ""}
          </div>
        </div>
      </div>
    </div>
  );

  // === TAB BAR ===
  var tabBar = (
    <div style={{ display: "flex", background: C.w, borderBottom: "1px solid " + C.p4, padding: "0 20px", overflowX: "auto" }}>
      {TABS.map(function (t) {
        var on = tab === t.id;
        return (
          <div
            key={t.id}
            onClick={function () { setTab(t.id); }}
            style={{
              padding: "12px 14px", fontSize: 12, fontWeight: on ? 600 : 500,
              whiteSpace: "nowrap", color: on ? C.purple : C.tp + "80",
              borderBottom: on ? "2px solid " + C.purple : "2px solid transparent",
              cursor: "pointer"
            }}
          >{t.l}</div>
        );
      })}
    </div>
  );

  // === ERROR BOX ===
  var errBox = err ? (
    <div style={{ background: C.rbg, border: "1px solid " + C.red + "40", borderRadius: 10, padding: 14, fontSize: 13, color: C.red, margin: "16px 0" }}>
      {err}
      <button onClick={function () { setErr(null); }} style={{ marginLeft: 12, background: "none", border: "none", color: C.red, fontWeight: 700, cursor: "pointer" }}>x</button>
    </div>
  ) : null;

  // ============================================================
  // SHARED RENDER FUNCTIONS
  // ============================================================

  // === TREND CARD ===
  function renderTrend(t, i) {
    var hc = hs(t.heat);
    return (
      <div key={"t" + i} style={sK}>
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
          <button
            disabled={bLd || gl}
            onClick={function () { doSmartGen("Create posts about: " + t.title + " - " + t.summary); }}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              color: C.purple, background: C.p3, border: "1px solid " + C.p4,
              cursor: "pointer", whiteSpace: "nowrap"
            }}
          >{gl ? "..." : "Generate"}</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // DRAFT / POST CARD (with status, asset notes, schedule, char counter)
  // ============================================================

  function renderPC(post, i, pfx, onDel) {
    var idx = pfx + "-" + i;
    var isCp = copied[idx];
    var isEd = eIdx === idx;
    var pc = pi(post.platform);
    var plr = post.pillar;
    var isPn = post.contentType === "Push Notification";
    var isSch = schIdx === i && pfx === "d";

    // Character counting
    var charLim = isPn ? PN_LIM.body : (CHAR_LIM[post.platform] || 4096);
    var curLen = isEd ? eTxt.length : (post.content || "").length;
    var charPct = curLen / charLim;
    var charColor = charPct > 1 ? C.red : charPct > 0.8 ? "#CA8A04" : C.green;

    // Status
    var st = post.status || "Draft";
    var stC = STATUS_C[st] || C.grey;

    return (
      <div key={idx} style={{
        background: C.w, borderLeft: "3px solid " + (isPn ? C.orange : pc.b),
        borderRadius: "0 12px 12px 0", border: "1px solid " + C.p4,
        borderLeftColor: isPn ? C.orange : pc.b, borderLeftWidth: 3,
        padding: 16, marginBottom: 10
      }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isPn ? (
              <span style={{ fontSize: 11, fontWeight: 600, color: C.orange }}>Push Notification</span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: pc.b }}>{pc.lb}</span>
            )}
            {post.tone ? <span style={{ fontSize: 10, color: C.tp + "80", background: C.pbg, padding: "2px 8px", borderRadius: 4 }}>{post.tone}</span> : null}
            {plr ? <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: (pillarC[plr] || C.grey) + "18", color: pillarC[plr] || C.grey, fontWeight: 600 }}>{plr}</span> : null}
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: stC + "18", color: stC, fontWeight: 700 }}>{st}</span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: charColor, fontWeight: 600 }}>{curLen}/{charLim}</span>
            <button
              onClick={function () { cpTxt(isEd ? eTxt : post.content, idx); }}
              style={Object.assign({}, sBs, isCp ? { background: C.green, color: C.w, borderColor: C.green } : {})}
            >{isCp ? "Copied!" : "Copy"}</button>
            <button
              onClick={function () {
                if (isEd) { post.content = eTxt; setEIdx(null); }
                else { setEIdx(idx); setETxt(post.content); }
              }}
              style={sBs}
            >{isEd ? "Save" : "Edit"}</button>
            {pfx === "d" ? (
              <button
                onClick={function () {
                  setSchIdx(isSch ? null : i);
                  setSchPlat(post.platform || "X");
                  setSchDate(new Date());
                  setSchWeekRef(new Date());
                }}
                style={Object.assign({}, sBs, { color: C.purple, borderColor: C.purple + "60" })}
              >{isSch ? "Cancel" : "Schedule"}</button>
            ) : null}
            {onDel ? <button onClick={onDel} style={sBDel}>Delete</button> : null}
          </div>
        </div>

        {/* Content */}
        {isEd ? (
          <textarea
            value={eTxt}
            onChange={function (e) { setETxt(e.target.value); }}
            style={{
              width: "100%", border: "1px solid " + C.p3, borderRadius: 10,
              padding: 12, fontSize: 13, color: C.tp, lineHeight: 1.6,
              minHeight: 80, fontFamily: "inherit", resize: "vertical"
            }}
          />
        ) : (
          <div style={{ fontSize: 14, color: C.tp, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {post.content}
          </div>
        )}

        {/* Status + Pillar save row (drafts only) */}
        {pfx === "d" ? (
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.tp + "60" }}>Status:</span>
            {STATUSES.slice(0, 3).map(function (s) {
              return (
                <button
                  key={s}
                  onClick={function () { setPostStatus(i, s); }}
                  style={Object.assign({}, sBs, st === s ? { background: STATUS_C[s] + "18", borderColor: STATUS_C[s], color: STATUS_C[s] } : {})}
                >{s}</button>
              );
            })}
            <span style={{ width: 1, height: 16, background: C.p4, margin: "0 2px" }}></span>
            <span style={{ fontSize: 10, color: C.tp + "60" }}>Save:</span>
            {PILLARS.map(function (p) {
              return (
                <button
                  key={p}
                  onClick={function () { saveP(post, p); }}
                  style={Object.assign({}, sBs, { color: pillarC[p], fontSize: 9 })}
                >{p.split("/")[0]}</button>
              );
            })}
          </div>
        ) : null}

        {/* Asset note (drafts only) */}
        {pfx === "d" ? (
          <div style={{ marginTop: 8 }}>
            <input
              value={post.assetNote || ""}
              onChange={function (e) { setAssetNote(i, e.target.value); }}
              placeholder="Asset note (e.g. Need chart graphic, Use Argentina jersey photo...)"
              style={{
                width: "100%", border: "1px solid " + C.p4, borderRadius: 8,
                padding: "6px 10px", fontSize: 11, color: C.tp,
                fontFamily: "inherit", background: C.pbg
              }}
            />
          </div>
        ) : null}

        {/* Schedule Picker */}
        {isSch ? (
          <div style={{ marginTop: 12, background: C.pbg, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.th, marginBottom: 10 }}>Schedule Post</div>

            {/* Platform selection */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.tp + "80", marginBottom: 4 }}>Platform</div>
              <div style={{ display: "flex", gap: 6 }}>
                {PLATS.map(function (p) {
                  var pc2 = pi(p);
                  var on = schPlat === p;
                  return (
                    <button
                      key={p}
                      onClick={function () { setSchPlat(p); }}
                      style={{
                        padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        border: "1px solid " + (on ? pc2.b : C.p4),
                        background: on ? pc2.bg : C.w,
                        color: on ? pc2.b : C.tp + "60", cursor: "pointer"
                      }}
                    >{pc2.ic} {p}</button>
                  );
                })}
              </div>
            </div>

            {/* Date selection */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: C.tp + "80" }}>Date</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={function () { var d = new Date(schWeekRef); d.setDate(d.getDate() - 7); setSchWeekRef(d); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.purple, fontWeight: 700, fontSize: 14 }}>&lt;</button>
                  <button onClick={function () { setSchWeekRef(new Date()); setSchDate(new Date()); }} style={Object.assign({}, sBs, { fontSize: 9, color: C.purple })}>Today</button>
                  <button onClick={function () { var d = new Date(schWeekRef); d.setDate(d.getDate() + 7); setSchWeekRef(d); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.purple, fontWeight: 700, fontSize: 14 }}>&gt;</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {getWeek(schWeekRef).map(function (d) {
                  var on = isSame(schDate, d);
                  var td = isToday(d);
                  return (
                    <button
                      key={dk(d)}
                      onClick={function () { setSchDate(d); }}
                      style={{
                        flex: 1, padding: "8px 2px", borderRadius: 8, fontSize: 10,
                        fontWeight: on ? 700 : 500,
                        border: "1px solid " + (on ? C.purple : C.p4),
                        background: on ? C.p3 : C.w,
                        color: on ? C.purple : C.tp, cursor: "pointer", textAlign: "center"
                      }}
                    >
                      <div>{DSHORT[(d.getDay() + 6) % 7]}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{d.getDate()}</div>
                      {td ? <div style={{ width: 4, height: 4, borderRadius: 2, background: C.purple, margin: "2px auto 0" }}></div> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm / Cancel */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { confirmSch(i); }} style={Object.assign({}, sB, { fontSize: 12, padding: "8px 20px" })}>Schedule</button>
              <button onClick={function () { setSchIdx(null); }} style={Object.assign({}, sBG, { fontSize: 12 })}>Cancel</button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ============================================================
  // METRICS ROW (Tracker)
  // ============================================================

  function renderMetricsRow(pIdx) {
    var m = metrics[pIdx] || {};
    var isEd = metEdit === pIdx;
    var fields = [
      { k: "impressions", l: "Impressions" },
      { k: "likes", l: "Likes" },
      { k: "comments", l: "Comments" },
      { k: "shares", l: "Shares" },
      { k: "clicks", l: "Clicks" }
    ];
    var hasAny = m.url || m.impressions || m.likes || m.comments || m.shares || m.clicks;

    // Empty state
    if (!isEd && !hasAny) {
      return (
        <button
          onClick={function () { setMetEdit(pIdx); }}
          style={Object.assign({}, sBs, { marginTop: 8, color: C.purple, borderColor: C.purple + "40" })}
        >+ Analytics</button>
      );
    }

    // Display mode
    if (!isEd) {
      var stats = [];
      fields.forEach(function (f) {
        if (m[f.k]) stats.push(Number(m[f.k]).toLocaleString() + " " + f.l.toLowerCase());
      });
      return (
        <div style={{ marginTop: 8, background: C.pbg, borderRadius: 10, padding: "10px 14px" }}>
          {m.url ? <div style={{ fontSize: 11, color: C.purple, marginBottom: 4, wordBreak: "break-all" }}>{m.url}</div> : null}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.tp, fontWeight: 500 }}>{stats.join(" · ") || "No metrics"}</span>
            <button onClick={function () { setMetEdit(pIdx); }} style={Object.assign({}, sBs, { fontSize: 9, color: C.purple })}>Edit</button>
          </div>
        </div>
      );
    }

    // Edit mode
    return (
      <div style={{ marginTop: 8, background: C.pbg, borderRadius: 10, padding: 14 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            value={m.url || ""}
            onChange={function (e) { setMetric(pIdx, "url", e.target.value); }}
            placeholder="Post URL"
            style={{ width: "100%", border: "1px solid " + C.p4, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontFamily: "inherit", color: C.tp }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {fields.map(function (f) {
            return (
              <div key={f.k} style={{ flex: "1 1 80px", minWidth: 80 }}>
                <div style={{ fontSize: 10, color: C.tp + "80", marginBottom: 3 }}>{f.l}</div>
                <input
                  type="number"
                  min="0"
                  value={m[f.k] || ""}
                  onChange={function (e) { setMetric(pIdx, f.k, e.target.value); }}
                  placeholder="0"
                  style={{ width: "100%", border: "1px solid " + C.p4, borderRadius: 8, padding: "6px 8px", fontSize: 12, fontFamily: "inherit", color: C.tp }}
                />
              </div>
            );
          })}
        </div>
        <button
          onClick={function () { setMetEdit(null); addLog("Updated analytics"); }}
          style={Object.assign({}, sBs, { marginTop: 10, color: C.green, borderColor: C.green })}
        >Done</button>
      </div>
    );
  }

  // ============================================================
  // GET DATA
  // ============================================================

  var D = getD();

  // ============================================================
  // TAB: BRIEFING
  // ============================================================

  if (tab === "briefing") {
    var trends = D.trends || [];

    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          {/* Smart command input */}
          <div style={Object.assign({}, sK, { padding: 16 })}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.th, marginBottom: 8 }}>What do you need?</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={sq}
                onChange={function (e) { setSq(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter") doBriefSearch(); }}
                placeholder="Create 5 posts for X this week... / Search trending news... / Paste a URL..."
                style={{ flex: 1, border: "1px solid " + C.p4, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.tp, outline: "none", fontFamily: "inherit" }}
              />
              <button
                disabled={bLd}
                onClick={doBriefSearch}
                style={Object.assign({}, sB, { whiteSpace: "nowrap" }, bLd ? { opacity: 0.5 } : {})}
              >{bLd ? "Working..." : "Go"}</button>
            </div>
            <div style={{ fontSize: 11, color: C.tp + "60", marginTop: 6 }}>
              Tip: Start with "Create", "Write", or "Generate" to produce content. Otherwise searches for trending news.
            </div>
          </div>

          {platSelect}
          {errBox}

          {/* Templates */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.th, marginBottom: 10 }}>Templates</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
            {TEMPLATES.map(function (t) {
              return (
                <div
                  key={t.id}
                  onClick={function () { setSq(t.prompt); }}
                  style={{ minWidth: 160, background: C.w, border: "1px solid " + C.p4, borderRadius: 12, padding: 14, cursor: "pointer", flexShrink: 0 }}
                >
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.th, marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.tp + "80", lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Search Results */}
          {bRes ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.th }}>Results ({bRes.length})</div>
                <button onClick={function () { setBRes(null); setSq(""); }} style={Object.assign({}, sBG, { fontSize: 11 })}>Clear</button>
              </div>
              {bRes.map(function (t, i) { return renderTrend(t, i + 100); })}
            </div>
          ) : null}

          {/* Trending */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.th }}>Trending ({trends.length})</div>
            <button
              disabled={ld && lw === "trends"}
              onClick={doRefreshTrends}
              style={Object.assign({}, sB, { fontSize: 12, padding: "8px 18px" }, ld && lw === "trends" ? { opacity: 0.5 } : {})}
            >{ld && lw === "trends" ? "Refreshing..." : "Refresh Trends"}</button>
          </div>
          {trends.map(function (t, i) { return renderTrend(t, i); })}

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // TAB: DRAFTS
  // ============================================================

  if (tab === "drafts") {
    var posts = gp || D.posts || [];

    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          {/* Quick generate */}
          <div style={Object.assign({}, sK, { display: "flex", gap: 8, alignItems: "center", padding: 14 })}>
            <input
              value={dq}
              onChange={function (e) { setDq(e.target.value); }}
              onKeyDown={function (e) { if (e.key === "Enter") doGenFromDrafts(); }}
              placeholder="Quick generate: describe what you need..."
              style={{ flex: 1, border: "1px solid " + C.p4, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.tp, outline: "none", fontFamily: "inherit" }}
            />
            <button
              disabled={gl}
              onClick={doGenFromDrafts}
              style={Object.assign({}, sB, { whiteSpace: "nowrap" }, gl ? { opacity: 0.5 } : {})}
            >{gl ? "..." : "Generate"}</button>
          </div>

          {platSelect}
          {errBox}

          <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Drafts ({posts.length})</div>

          {posts.length === 0 ? (
            <div style={Object.assign({}, sK, { textAlign: "center", padding: 36 })}>
              <div style={{ color: C.tp + "70", marginBottom: 12 }}>No drafts yet.</div>
              <button onClick={function () { setTab("briefing"); }} style={Object.assign({}, sB, { fontSize: 12 })}>Go to Briefing</button>
            </div>
          ) : null}

          {posts.map(function (p, i) {
            return renderPC(p, i, "d", function () { delDraft(i); });
          })}

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // TAB: SAVED
  // ============================================================

  if (tab === "saved") {
    var gr = {};
    for (var i = 0; i < saved.length; i++) {
      var p = saved[i].pillar || "Other";
      if (!gr[p]) gr[p] = [];
      gr[p].push({ post: saved[i], sIdx: i });
    }

    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Saved Library ({saved.length})</div>

          {saved.length === 0 ? (
            <div style={Object.assign({}, sK, { textAlign: "center", padding: 36 })}>
              <div style={{ color: C.tp + "70", marginBottom: 12 }}>Save posts from Drafts.</div>
              <button onClick={function () { setTab("drafts"); }} style={Object.assign({}, sB, { fontSize: 12 })}>Go to Drafts</button>
            </div>
          ) : null}

          {PILLARS.map(function (pl) {
            var ps = gr[pl] || [];
            if (!ps.length) return null;
            return (
              <div key={pl} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: pillarC[pl] }}></span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.th }}>{pl} ({ps.length})</span>
                </div>
                {ps.map(function (item, j) {
                  return renderPC(item.post, j, "s-" + pl, function () { delSaved(item.sIdx); });
                })}
              </div>
            );
          })}

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // TAB: CALENDAR
  // ============================================================

  if (tab === "calendar") {

    var calNavBtns = (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={function () { calNav(-1); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.purple, fontWeight: 700, fontSize: 18 }}>&lt;</button>
        <button onClick={calToday} style={Object.assign({}, sBs, { color: C.purple, borderColor: C.purple + "50", fontSize: 11 })}>Today</button>
        <button onClick={function () { calNav(1); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.purple, fontWeight: 700, fontSize: 18 }}>&gt;</button>
      </div>
    );

    var viewToggle = (
      <div style={{ display: "flex", gap: 2, background: C.pbg, borderRadius: 8, padding: 2 }}>
        {["month", "week", "day"].map(function (v) {
          var on = calView === v;
          return (
            <button
              key={v}
              onClick={function () { setCalView(v); if (v === "day") setCalSel(calRef); }}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 11,
                fontWeight: on ? 700 : 500, background: on ? C.w : "transparent",
                color: on ? C.purple : C.tp + "80", border: "none",
                cursor: "pointer", textTransform: "capitalize"
              }}
            >{v}</button>
          );
        })}
      </div>
    );

    // === MONTH VIEW ===
    if (calView === "month") {
      var grid = getMonthGrid(calRef.getFullYear(), calRef.getMonth());
      var curMonth = calRef.getMonth();

      return (
        <div style={sP}>
          {tourOverlay}
          {header}
          {tabBar}
          <div style={sC}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.th }}>{MONTHS[calRef.getMonth()]} {calRef.getFullYear()}</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>{viewToggle}{calNavBtns}</div>
            </div>
            {errBox}

            <div style={{ background: C.w, borderRadius: 14, border: "1px solid " + C.p4, overflow: "hidden" }}>
              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid " + C.p4 }}>
                {DSHORT.map(function (d) {
                  return <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: C.tp + "80" }}>{d}</div>;
                })}
              </div>
              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {grid.map(function (d, i) {
                  var key = dk(d);
                  var cnt = calCountForDay(d);
                  var inMonth = d.getMonth() === curMonth;
                  var td = isToday(d);

                  // Platform color dots
                  var dots = [];
                  var seen = {};
                  (calP[key] || []).forEach(function (p) {
                    var c = pi(p.platform).b;
                    if (!seen[c]) { seen[c] = true; dots.push(c); }
                  });

                  return (
                    <div
                      key={i}
                      onClick={function () { setCalSel(d); setCalRef(d); setCalView("day"); }}
                      style={{
                        minHeight: 72, padding: "6px 8px",
                        borderRight: (i + 1) % 7 === 0 ? "none" : "1px solid " + C.p4 + "80",
                        borderBottom: i < grid.length - 7 ? "1px solid " + C.p4 + "80" : "none",
                        cursor: "pointer",
                        background: td ? C.p3 + "40" : "transparent",
                        opacity: inMonth ? 1 : 0.35
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: td ? 700 : 500, color: td ? C.purple : C.tp, marginBottom: 4 }}>
                        {d.getDate()}
                      </div>
                      {cnt > 0 ? (
                        <div>
                          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 2 }}>
                            {dots.map(function (c, j) { return <div key={j} style={{ width: 6, height: 6, borderRadius: 3, background: c }}></div>; })}
                          </div>
                          <div style={{ fontSize: 10, color: C.tp + "70" }}>{cnt}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {floatingBtns}
          {toastEl}
        </div>
      );
    }

    // === WEEK VIEW ===
    if (calView === "week") {
      var week = getWeek(calRef);
      var cov = calCoverage(week);

      return (
        <div style={sP}>
          {tourOverlay}
          {header}
          {tabBar}
          <div style={sC}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.th }}>{fmtD(week[0])} – {fmtD(week[6])}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: C.tp + "80" }}>Coverage: {cov}/7</div>
                  <div style={{ width: 70, height: 6, borderRadius: 3, background: C.p4 }}>
                    <div style={{ width: Math.round(cov / 7 * 100) + "%", height: 6, borderRadius: 3, background: cov >= 5 ? C.green : cov >= 3 ? "#CA8A04" : C.red }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>{viewToggle}{calNavBtns}</div>
            </div>
            {errBox}

            {week.map(function (d) {
              var key = dk(d);
              var ps = calP[key] || [];
              var td = isToday(d);

              return (
                <div key={key} style={Object.assign({}, sK, { padding: 16, borderLeft: td ? "3px solid " + C.purple : "1px solid " + C.p4 })}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: ps.length > 0 ? 10 : 0, cursor: "pointer" }}
                    onClick={function () { setCalSel(d); setCalRef(d); setCalView("day"); }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: td ? C.purple : C.th }}>
                      {DSHORT[(d.getDay() + 6) % 7]}, {fmtD(d)}
                      {td ? <span style={{ fontSize: 10, color: C.purple, marginLeft: 8, fontWeight: 500 }}>Today</span> : ""}
                    </div>
                    <span style={{ fontSize: 11, color: C.tp + "60" }}>{ps.length}</span>
                  </div>

                  {ps.map(function (p, j) {
                    var pc = pi(p.platform);
                    return (
                      <div key={j} style={{ background: C.pbg, borderRadius: 10, padding: 12, marginBottom: 6, borderLeft: "3px solid " + pc.b }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: pc.b }}>{pc.lb}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={function () { cpTxt(p.content, "c-" + key + "-" + j); }}
                              style={Object.assign({}, sBs, copied["c-" + key + "-" + j] ? { background: C.green, color: C.w } : {})}
                            >{copied["c-" + key + "-" + j] ? "Copied!" : "Copy"}</button>
                            <button onClick={function () { markPosted(p); }} style={Object.assign({}, sBs, { color: C.green })}>Posted</button>
                            <button onClick={function () { delCal(key, j); }} style={sBDel}>Del</button>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: C.tp, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {(p.content || "").substring(0, 140)}{(p.content || "").length > 140 ? "..." : ""}
                        </div>
                      </div>
                    );
                  })}

                  {ps.length === 0 ? <div style={{ fontSize: 12, color: C.tp + "40", fontStyle: "italic" }}>No posts</div> : null}
                </div>
              );
            })}

          </div>
          {floatingBtns}
          {toastEl}
        </div>
      );
    }

    // === DAY VIEW ===
    var dayKey = dk(calSel);
    var dayPosts = calP[dayKey] || [];
    var td2 = isToday(calSel);

    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: td2 ? C.purple : C.th }}>{fmtFull(calSel)}</div>
              {td2 ? <div style={{ fontSize: 11, color: C.purple, marginTop: 2 }}>Today</div> : null}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>{viewToggle}{calNavBtns}</div>
          </div>
          {errBox}

          <div style={{ fontSize: 14, fontWeight: 600, color: C.th, marginBottom: 12 }}>
            {dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}
          </div>

          {dayPosts.length === 0 ? (
            <div style={Object.assign({}, sK, { textAlign: "center", padding: 36 })}>
              <div style={{ color: C.tp + "70", marginBottom: 12 }}>Nothing scheduled.</div>
              <button onClick={function () { setTab("drafts"); }} style={Object.assign({}, sB, { fontSize: 12 })}>Pick from Drafts</button>
            </div>
          ) : null}

          {dayPosts.map(function (p, j) {
            var pc = pi(p.platform);
            return (
              <div key={j} style={Object.assign({}, sK, { padding: 16, borderLeft: "3px solid " + pc.b })}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pc.b }}>{pc.lb}</span>
                    <span style={{ fontSize: 10, color: C.tp + "60" }}>#{j + 1}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={function () { cpTxt(p.content, "cd-" + j); }}
                      style={Object.assign({}, sBs, copied["cd-" + j] ? { background: C.green, color: C.w } : {})}
                    >{copied["cd-" + j] ? "Copied!" : "Copy"}</button>
                    <button onClick={function () { markPosted(p); }} style={Object.assign({}, sBs, { color: C.green, borderColor: C.green })}>Mark Posted</button>
                    <button onClick={function () { delCal(dayKey, j); }} style={sBDel}>Delete</button>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: C.tp, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{p.content}</div>
              </div>
            );
          })}

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // TAB: RESEARCH
  // ============================================================

  if (tab === "research") {
    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Research</div>

          {/* Search input */}
          <div style={Object.assign({}, sK, { padding: 16 })}>
            <div style={{ fontSize: 13, color: C.tp + "80", marginBottom: 10 }}>Research any topic, competitor, link, or account.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={resQ}
                onChange={function (e) { setResQ(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter") doResearch(); }}
                placeholder="e.g. Binance campaign, @ZachXBT, solana.com, DeFi trends..."
                style={{ flex: 1, border: "1px solid " + C.p4, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.tp, fontFamily: "inherit" }}
              />
              <button
                disabled={resLd}
                onClick={doResearch}
                style={Object.assign({}, sB, resLd ? { opacity: 0.5 } : {})}
              >{resLd ? "..." : "Research"}</button>
            </div>
          </div>
          {errBox}

          {/* Research Findings */}
          {resFin ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.th, margin: "16px 0 10px" }}>Findings ({resFin.length})</div>
              {resFin.map(function (f, i) {
                return (
                  <div key={i} style={sK}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.th, marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: C.tp + "90", lineHeight: 1.55, marginBottom: 6 }}>{f.summary}</div>
                    {f.source ? <div style={{ fontSize: 11, color: C.purple }}>Source: {f.source}</div> : null}
                    <button
                      onClick={function () { doSmartGen("Create posts about: " + f.title + " - " + f.summary); }}
                      style={Object.assign({}, sBs, { marginTop: 8, color: C.purple, borderColor: C.purple + "50" })}
                    >Generate Posts</button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Source Library */}
          <div style={Object.assign({}, sK, { marginTop: 16 })}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 10 }}>Source Library</div>

            {Object.keys(RESEARCH_SOURCES).map(function (cat) {
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 4 }}>{cat}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {RESEARCH_SOURCES[cat].map(function (s) {
                      return (
                        <button key={s} onClick={function () { setResQ(s); }} style={Object.assign({}, sBs, { fontSize: 10 })}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Custom Sources */}
            {customSrc.length > 0 ? (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.green, marginBottom: 4 }}>Custom Sources</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {customSrc.map(function (s, i) {
                    return (
                      <button key={i} onClick={function () { setResQ(s); }} style={Object.assign({}, sBs, { fontSize: 10, color: C.green, borderColor: C.green + "50" })}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Add custom source */}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input
                value={csIn}
                onChange={function (e) { setCsIn(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter") addCustomSrc(); }}
                placeholder="Add source (topic, link, @account...)"
                style={{ flex: 1, border: "1px solid " + C.p4, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontFamily: "inherit", color: C.tp }}
              />
              <button onClick={addCustomSrc} style={Object.assign({}, sBG, { fontSize: 11 })}>Add</button>
            </div>
          </div>

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // TAB: REPLIES
  // ============================================================

  if (tab === "replies") {
    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 14 }}>Engagement Replies</div>

          <div style={Object.assign({}, sK, { padding: 16 })}>
            <textarea
              value={rIn}
              onChange={function (e) { setRIn(e.target.value); }}
              placeholder="Paste tweet or describe the conversation..."
              style={{
                width: "100%", border: "1px solid " + C.p4, borderRadius: 10,
                padding: 14, fontSize: 13, minHeight: 80, fontFamily: "inherit",
                resize: "vertical", marginBottom: 12, color: C.tp
              }}
            />
            {platSelect}
            <button
              disabled={rLd}
              onClick={doReply}
              style={Object.assign({}, sB, rLd ? { opacity: 0.5 } : {})}
            >{rLd ? "..." : "Generate Reply"}</button>
          </div>
          {errBox}

          {rRes ? (
            <div>
              {rRes.map(function (r, i) { return renderPC(r, i, "rp"); })}
            </div>
          ) : null}

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // TAB: TRACKER
  // ============================================================

  if (tab === "tracker") {
    var bP = {};
    var totImpr = 0, totLikes = 0, totComments = 0, totShares = 0, totClicks = 0;

    for (var i = 0; i < posted.length; i++) {
      var p = posted[i].platform || "?";
      bP[p] = (bP[p] || 0) + 1;
      var m = metrics[i] || {};
      totImpr += Number(m.impressions) || 0;
      totLikes += Number(m.likes) || 0;
      totComments += Number(m.comments) || 0;
      totShares += Number(m.shares) || 0;
      totClicks += Number(m.clicks) || 0;
    }

    var hasMetrics = totImpr + totLikes + totComments + totShares + totClicks > 0;

    return (
      <div style={sP}>
        {tourOverlay}
        {header}
        {tabBar}
        <div style={sC}>

          <div style={{ fontSize: 15, fontWeight: 700, color: C.th, marginBottom: 16 }}>Performance Tracker</div>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { n: posted.length, l: "Published", c: C.purple },
              { n: saved.length, l: "Saved", c: C.green },
              { n: Object.keys(bP).length, l: "Platforms", c: C.blue }
            ].map(function (s) {
              return (
                <div key={s.l} style={Object.assign({}, sK, { flex: 1, minWidth: 120, textAlign: "center", padding: 24 })}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: C.tp + "80" }}>{s.l}</div>
                </div>
              );
            })}
          </div>

          {/* Aggregate Analytics */}
          {hasMetrics ? (
            <div style={Object.assign({}, sK, { marginBottom: 16 })}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 12 }}>Aggregate Analytics</div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[
                  { l: "Impressions", n: totImpr, c: C.purple },
                  { l: "Likes", n: totLikes, c: C.red },
                  { l: "Comments", n: totComments, c: C.blue },
                  { l: "Shares", n: totShares, c: C.green },
                  { l: "Clicks", n: totClicks, c: C.orange }
                ].map(function (s) {
                  return (
                    <div key={s.l} style={{ flex: "1 1 100px", textAlign: "center", background: C.pbg, borderRadius: 10, padding: "14px 10px" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.n.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: C.tp + "80" }}>{s.l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* By Platform */}
          {Object.keys(bP).length > 0 ? (
            <div style={Object.assign({}, sK, { marginBottom: 16 })}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 12 }}>By Platform</div>
              {Object.keys(bP).map(function (p) {
                var pc = pi(p);
                var pct = Math.round((bP[p] / posted.length) * 100);
                return (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 80 }}>{pc.lb}</span>
                    <div style={{ flex: 1, background: C.pbg, borderRadius: 6, height: 22 }}>
                      <div style={{ width: pct + "%", background: pc.b, borderRadius: 6, height: 22, minWidth: 20 }}></div>
                    </div>
                    <span style={{ fontSize: 12, color: C.tp + "80", minWidth: 24 }}>{bP[p]}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Published Posts */}
          <div style={{ fontSize: 13, fontWeight: 600, color: C.th, marginBottom: 10 }}>Published Posts</div>

          {posted.length === 0 ? (
            <div style={Object.assign({}, sK, { textAlign: "center", padding: 30 })}>
              <div style={{ color: C.tp + "70", marginBottom: 12 }}>Mark posts as Posted from Calendar.</div>
              <button onClick={function () { setTab("calendar"); }} style={Object.assign({}, sB, { fontSize: 12 })}>Go to Calendar</button>
            </div>
          ) : null}

          {posted.map(function (p, i) {
            var pc = pi(p.platform);
            return (
              <div key={i} style={Object.assign({}, sK, { padding: 16 })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pc.b }}>{pc.lb}</span>
                    <span style={{ fontSize: 10, color: C.tp + "50" }}>{p.postedAt}</span>
                  </div>
                  <button onClick={function () { delPosted(i); }} style={sBDel}>Delete</button>
                </div>
                <div style={{ fontSize: 13, color: C.tp, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.content}</div>
                {renderMetricsRow(i)}
              </div>
            );
          })}

        </div>
        {floatingBtns}
        {toastEl}
      </div>
    );
  }

  // ============================================================
  // DEFAULT / FALLBACK
  // ============================================================

  return (
    <div style={sP}>
      {tourOverlay}
      {header}
      {tabBar}
      {floatingBtns}
      {toastEl}
    </div>
  );
}
