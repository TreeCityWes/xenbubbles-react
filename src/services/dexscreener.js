const BASE_URL = 'https://api.dexscreener.com/latest';
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

export const fetchTokenData = async (chain, contract, timeFrame = '24h') => {
  const cacheKey = `${contract}-${timeFrame}`;
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
    const response = await fetch(`${BASE_URL}/dex/tokens/${contract}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.pairs || data.pairs.length === 0) return null;

    const pair = data.pairs[0];
    const priceChange = timeFrame === '5m' ? pair.priceChange?.m5 :
                       timeFrame === '1h' ? pair.priceChange?.h1 :
                       timeFrame === '6h' ? pair.priceChange?.h6 :
                       pair.priceChange?.h24;

    const result = {
      price: parseFloat(pair.priceUsd),
      priceChange24h: priceChange,
      marketCap: pair.marketCap,
      volume24h: pair.volume?.h24,
      liquidity: pair.liquidity?.usd,
      chain: pair.chainId,
      contract: pair.baseToken?.address,
      imageUrl: pair.info?.imageUrl,
      symbol: pair.baseToken?.symbol,
      dexId: pair.dexId,
      pairAddress: pair.pairAddress
    };

    cache.set(cacheKey, {
      timestamp: now,
      data: result
    });

    return result;
  } catch (error) {
    console.error('Error fetching token data:', error);
    return null;
  }
};

const getColorFromPriceChange = (priceChange) => {
  if (priceChange > 5) return '#16a085';  // Strong green
  if (priceChange > 0) return '#2ecc71';  // Light green
  if (priceChange < -5) return '#c0392b'; // Strong red
  if (priceChange < 0) return '#e74c3c';  // Light red
  return '#3498db';                       // Neutral blue
}; 