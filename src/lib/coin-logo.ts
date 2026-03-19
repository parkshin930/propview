/**
 * 바이낸스 공식 + 글로벌 폴백 (Trust Wallet/CoinGecko/CryptoLogos 등)
 * symbol_base = USDT 제외한 순수 코인명, 소문자로 매칭
 */

const BINANCE_BASE = "https://bin.bnbstatic.com/static/assets/logos";
/** 코인베이스 공식 로고 (64px). 심볼 소문자 사용 시 컬러 로고 제공 */
export const COINBASE_LOGO_BASE = "https://static-assets.coinbase.com/coins/64";
const CRYPTOICONS_BASE = "https://cryptoicons.org/api/icon";
const COINGECKO_BASE = "https://assets.coingecko.com/coins/images";

/** 거래량 상위 ~50개: public/images/coins/{symbol}.png 에 로컬 저장 시 우선 사용 */
const TOP_50_SYMBOLS = new Set(
  [
    "BTC", "ETH", "BNB", "SOL", "XRP", "USDT", "USDC", "ADA", "DOGE", "AVAX",
    "LINK", "UNI", "LTC", "DOT", "MATIC", "ATOM", "TRX", "SHIB", "PEPE", "SUI",
    "APT", "ARB", "OP", "INJ", "TIA", "SEI", "WLD", "NEAR", "FIL", "IMX",
    "RENDER", "FET", "RON", "STX", "HBAR", "VET", "ICP", "AAVE", "ETC", "XLM",
    "XMR", "BCH", "ALGO", "GRT", "SAND", "MANA", "AXS", "FTM", "THETA", "EOS",
  ].map((s) => s.toUpperCase())
);

/** CoinGecko coins/images/{id}/small - 심볼별 공식 로고 (바이낸스 실패 시 폴백) */
const COINGECKO_LOGO: Record<string, string> = {
  BTC: "1/small/bitcoin.png",
  ETH: "279/small/ethereum.png",
  BNB: "825/small/bnb-icon2_2x.png",
  SOL: "4128/small/solana.png",
  XRP: "44/small/xrp-symbol-white-128.png",
  USDT: "325/small/Tether.png",
  USDC: "6319/small/usdc.png",
  ADA: "975/small/cardano.png",
  DOGE: "5/small/dogecoin.png",
  AVAX: "12559/small/Avalanche_Circle_RedWhite_Trans.png",
  LINK: "877/small/chainlink-new-logo.png",
  UNI: "12504/small/uniswap-logo.png",
  LTC: "2/small/litecoin.png",
  DOT: "12171/small/polkadot.png",
  MATIC: "4713/small/matic-token-icon.png",
  ATOM: "1481/small/cosmos_hub.png",
  TRX: "1094/small/tron-logo.png",
  SHIB: "11939/small/shiba.png",
  PEPE: "29850/small/pepe-token.jpeg",
  SUI: "26375/small/sui_asset.jpeg",
  APT: "26455/small/aptos_round.png",
  ARB: "16547/small/photo_2023-03-29_21.47.00.jpeg",
  OP: "25244/small/Optimism.png",
  INJ: "12882/small/Secondary_Symbol.png",
  TIA: "31967/small/tia.jpg",
  SEI: "28205/small/Sei_Logo_-_Transparent.png",
  WLD: "31069/small/worldlog.jpg",
  NEAR: "10365/small/near.jpg",
  FIL: "12817/small/filecoin.png",
  IMX: "17233/small/imx.png",
  RENDER: "11636/small/Render_Icon_Logo.png",
  FET: "5681/small/Fetch.jpg",
  RON: "3123/small/ronin.png",
  STX: "13295/small/blockstack.png",
  HBAR: "4648/small/hbar.png",
  VET: "1167/small/VEN_Token_Icon.png",
  ICP: "14495/small/internet-computer-icp.png",
  AAVE: "12645/small/AAVE.png",
  ETC: "805/small/classic.png",
  XLM: "100/small/stellarcoin.png",
  XMR: "69/small/monero_logo.png",
  BCH: "780/small/bitcoin-cash-circle.png",
  ALGO: "4380/small/download.png",
  GRT: "3830/small/Graph_Token.png",
  SAND: "12129/small/sandbox-logos.jpg",
  MANA: "878/small/decentraland-mana.png",
  AXS: "13029/small/axie_infinity_logo.png",
  FTM: "4001/small/Fantom_round.png",
  THETA: "2538/small/theta-token-logo.png",
  EOS: "738/small/eos-eos-logo.png",
  ASTR: "12419/small/astar.png",
  KAVA: "9761/small/kava.png",
  ZEC: "486/small/zcash-zec-logo.png",
  XTZ: "976/small/xtz.png",
  NEO: "480/small/NEO_512_512.png",
  KSM: "9568/small/kusama.png",
  COMP: "10703/small/COMP.png",
  MKR: "1364/small/MKR.png",
  SNX: "3406/small/snx.png",
  CRV: "12124/small/Curve.png",
  SUSHI: "12271/small/sushilogo.png",
  YFI: "11849/small/yfi-192x192.png",
  ONE: "4344/small/harmony-one-logo.png",
  ZIL: "2687/small/Zilliqa-logo.png",
  ENJ: "1102/small/enjin-coin-logo.png",
  CHZ: "8834/small/Chiliz.png",
  BAT: "677/small/bat.png",
  ZRX: "863/small/0x.png",
  DASH: "19/small/dash-logo.png",
  WAVES: "425/small/waves.png",
  QTUM: "1191/small/qtum.png",
  ICX: "912/small/icx-logo-big.png",
  OMG: "776/small/OMG_Network.png",
  ANKR: "4324/small/ankr-logo.png",
  CELO: "11013/small/celo.png",
  REN: "3139/small/REN.png",
  LSK: "1138/small/lisk.png",
  DGB: "63/small/digibyte.png",
  HOT: "3827/small/HOT.png",
  CELR: "3818/small/Celr.png",
  CVC: "788/small/civic.png",
  IOST: "2523/small/IOST.png",
  OGN: "8207/small/ogn.png",
  RSR: "8365/small/rsr.png",
  MASK: "14069/small/Mask_Network_NEW.png",
  LPT: "7660/small/LPT.png",
  AUDIO: "8082/small/Audius.png",
  API3: "8826/small/api3.jpg",
  ROSE: "10363/small/oasis-network-logo.jpg",
  C98: "11717/small/98.png",
  GALA: "12493/small/Gala-Launched.png",
  JASMY: "13884/small/jasmy.png",
  ENS: "12585/small/ens.jpg",
  BLUR: "28452/small/blur.png",
  MAGIC: "18623/small/magic.png",
  PENDLE: "23548/small/pendle.png",
  WOO: "15119/small/woo.png",
  DYDX: "17500/small/dydx.png",
  JUP: "22571/small/jupiter-exchange-jupiter-logo.png",
  PIXEL: "33359/small/pixels.png",
  STRK: "26433/small/starknet.png",
  W: "17362/small/w.png",
  TNSR: "28324/small/tnsr.png",
  SAGA: "34663/small/saga.png",
  TAO: "28452/small/bittensor.png",
  WIF: "33566/small/dogwifhat.png",
  NOT: "35671/small/notcoin.png",
  ZRO: "40231/small/zro.png",
  PORTAL: "32444/small/portal.png",
};

/** 코인베이스 공식 로고 URL (심볼 소문자). 프랍뷰 등 단일 소스 로고용 */
export function getCoinbaseLogoUrl(symbol: string): string {
  return `${COINBASE_LOGO_BASE}/${symbol.toLowerCase()}.png`;
}

/** 2순위(백업): 바이낸스 공식 로고 (symbol 소문자). 1순위는 CoinGecko /coins/markets image 필드. */
export function getBinanceLogoUrl(baseAsset: string): string {
  return `${BINANCE_BASE}/${baseAsset.toLowerCase()}.png`;
}

/**
 * 로고 URL 우선순위: 1) 로컬(상위50) 2) 바이낸스 3) 코인게코 4) CryptoIcons
 * 이미지 깨질 때 onError로 다음 소스 시도.
 */
export function getOrderedLogoUrls(baseAsset: string): string[] {
  const sym = baseAsset.toUpperCase();
  const lower = baseAsset.toLowerCase();
  const urls: string[] = [];
  if (TOP_50_SYMBOLS.has(sym)) {
    urls.push(`/images/coins/${lower}.png`);
  }
  urls.push(`${BINANCE_BASE}/${lower}.png`);
  const cg = COINGECKO_LOGO[sym];
  if (cg) urls.push(`${COINGECKO_BASE}/${cg}`);
  urls.push(`${CRYPTOICONS_BASE}/${lower}/200`);
  return urls;
}

/** 2~N순위 폴백 URL 목록 (Binance → CoinGecko → cryptoicons) — 하위 호환 */
export function getFallbackLogoUrls(baseAsset: string): string[] {
  const ordered = getOrderedLogoUrls(baseAsset);
  const binance = `${BINANCE_BASE}/${baseAsset.toLowerCase()}.png`;
  const idx = ordered.indexOf(binance);
  return idx >= 0 ? ordered.slice(idx) : ordered;
}

/** 1순위가 이미 바이낸스일 때 사용 — CoinGecko → CryptoIcons만 (바이낸스 재시도 제외) */
export function getFallbackLogoUrlsWithoutBinance(baseAsset: string): string[] {
  const sym = baseAsset.toUpperCase();
  const lower = baseAsset.toLowerCase();
  const urls: string[] = [];
  const cg = COINGECKO_LOGO[sym];
  if (cg) urls.push(`${COINGECKO_BASE}/${cg}`);
  urls.push(`${CRYPTOICONS_BASE}/${lower}/200`);
  return urls;
}

/** 최후 수단 알파벳 배지용 코인 브랜드 색상 (없으면 기본 #2d9d78) */
export const COIN_BRAND_COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  BNB: "#f3ba2f",
  SOL: "#9945ff",
  XRP: "#23292f",
  ADA: "#0033ad",
  DOGE: "#c2a633",
  AVAX: "#e84142",
  LINK: "#2a5ada",
  UNI: "#ff007a",
  LTC: "#345d9d",
  DOT: "#e6007a",
  MATIC: "#8247e5",
  ATOM: "#2e3148",
  TRX: "#ff0013",
  SHIB: "#fda32b",
  PEPE: "#3cb34f",
  SUI: "#6fbcf0",
  APT: "#3fb8af",
  ARB: "#28a0f0",
  OP: "#ff0420",
  NEAR: "#00c08b",
  FIL: "#0090ff",
  AAVE: "#b6509e",
  XLM: "#000000",
  XMR: "#ff6600",
  BCH: "#8dc351",
  FTM: "#1969ff",
  EOS: "#000000",
};

export function getCoinBrandColor(symbol: string): string {
  return COIN_BRAND_COLORS[symbol.toUpperCase()] ?? "#2d9d78";
}
