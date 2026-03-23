export var SOURCES = {
  publications: [
    "CoinTelegraph", "CoinDesk", "The Block", "Decrypt",
    "BeInCrypto", "DL News", "The Defiant", "Blockworks"
  ],
  kols: [
    "@ZachXBT", "@lookonchain", "@WuBlockchain", "@0xMert_",
    "@DefiIgnas", "@Route2FI", "@CryptoCapo_", "@inversebrah",
    "@cobie", "@AltcoinGordon"
  ],
  competitors: [
    "Binance", "OKX", "Coinbase", "Bybit", "Kraken", "Bitget"
  ],
  trendKeywords: [
    "Bitcoin", "Ethereum", "crypto regulation", "DeFi", "NFT",
    "Web3", "crypto ETF", "stablecoins", "Layer 2", "memecoins"
  ]
};

export function getSourcesPrompt() {
  var parts = [];
  parts.push("Search these crypto publications for latest news: " + SOURCES.publications.join(", "));
  parts.push("Check what these crypto KOLs are discussing on X/Twitter: " + SOURCES.kols.join(", "));
  parts.push("Monitor these competitors for recent moves: " + SOURCES.competitors.join(", "));
  parts.push("Check trending topics around: " + SOURCES.trendKeywords.join(", "));
  return parts.join(". ");
}
