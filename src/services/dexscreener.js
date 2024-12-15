const BASE_URL = 'https://api.dexscreener.com/latest';
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Chain mapping for DexScreener API
const chainMapping = {
  ethereum: 'ethereum',
  bsc: 'bsc',
  polygon: 'polygon',
  avalanche: 'avalanche',
  fantom: 'fantom',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  cronos: 'cronos',
  dogechain: 'dogechain',
  moonriver: 'moonriver',
  moonbeam: 'moonbeam',
  base: 'base',
  pulsechain: 'pulsechain',
  evmos: 'evmos',
  ethereumpow: 'ethereumpow',
  dogechainm: 'dogechain'
};

export const fetchTokenData = async (chain, contract, timeframe = '24h') => {
  const cacheKey = `${chain}-${contract}-${timeframe}`;
  const now = Date.now();

  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  try {
    const dexChain = chainMapping[chain.toLowerCase()] || chain.toLowerCase();
    const url = `${BASE_URL}/dex/tokens/${contract}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      console.log(`No pairs found for ${chain}:${contract}`);
      return null;
    }

    const chainPairs = data.pairs.filter(pair => 
      pair.chainId.toLowerCase() === dexChain
    );

    if (chainPairs.length === 0) {
      console.log(`No pairs found for specific chain ${chain}:${contract}`);
      return null;
    }

    const sortedPairs = chainPairs.sort((a, b) => 
      (parseFloat(b.liquidity?.usd) || 0) - (parseFloat(a.liquidity?.usd) || 0)
    );

    const mainPair = sortedPairs[0];

    // Get price change based on timeframe
    const getPriceChange = (pair, tf) => {
      switch(tf) {
        case '5m': return parseFloat(pair.priceChange?.m5) || 0;
        case '1h': return parseFloat(pair.priceChange?.h1) || 0;
        case '6h': return parseFloat(pair.priceChange?.h6) || 0;
        case '24h': return parseFloat(pair.priceChange?.h24) || 0;
        default: return parseFloat(pair.priceChange?.h24) || 0;
      }
    };
    
    const result = {
      price: parseFloat(mainPair.priceUsd) || 0,
      priceChange24h: getPriceChange(mainPair, timeframe),
      volume24h: parseFloat(mainPair.volume?.h24) || 0,
      liquidity: parseFloat(mainPair.liquidity?.usd) || 0,
      marketCap: parseFloat(mainPair.fdv) || 0,
      pairAddress: mainPair.pairAddress,
      dexId: mainPair.dexId,
      chain: mainPair.chainId,
      contract: mainPair.baseToken.address,
      // Add logo URLs
      logoUrl: mainPair.baseToken.logoUrl || mainPair.info?.logoUrl,
      imageUrl: mainPair.info?.imageUrl || mainPair.baseToken.logoUrl,
      // Token information
      symbol: mainPair.baseToken.symbol,
      name: mainPair.baseToken.name,
      baseToken: {
        name: mainPair.baseToken.name,
        symbol: mainPair.baseToken.symbol,
        address: mainPair.baseToken.address,
        logoUrl: mainPair.baseToken.logoUrl
      },
      quoteToken: {
        name: mainPair.quoteToken.name,
        symbol: mainPair.quoteToken.symbol,
        address: mainPair.quoteToken.address
      },
      // Additional metrics
      priceUsd: parseFloat(mainPair.priceUsd) || 0,
      priceNative: parseFloat(mainPair.priceNative) || 0,
      liquidityUsd: parseFloat(mainPair.liquidity?.usd) || 0,
      liquidityBase: parseFloat(mainPair.liquidity?.base) || 0,
      liquidityQuote: parseFloat(mainPair.liquidity?.quote) || 0
    };

    // Cache the result
    cache.set(cacheKey, {
      timestamp: now,
      data: result
    });

    return result;
  } catch (error) {
    console.error(`Error fetching data for ${chain}:${contract}:`, error);
    return null;
  }
};

// Helper function for color coding based on price change
export const getColorFromPriceChange = (priceChange) => {
  if (priceChange > 5) return '#16a085';  // Strong green
  if (priceChange > 0) return '#2ecc71';  // Light green
  if (priceChange < -5) return '#c0392b'; // Strong red
  if (priceChange < 0) return '#e74c3c';  // Light red
  return '#3498db';                       // Neutral blue
}; 