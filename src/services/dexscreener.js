const BASE_URL = 'https://api.dexscreener.com/latest';

export const fetchTokenData = async (chain, contract, timeFrame = '24h') => {
  try {
    const response = await fetch(`${BASE_URL}/dex/tokens/${contract}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    const pair = data.pairs[0];
    let priceChange;

    switch(timeFrame) {
      case '5m':
        priceChange = pair.priceChange?.m5;
        break;
      case '1h':
        priceChange = pair.priceChange?.h1;
        break;
      case '6h':
        priceChange = pair.priceChange?.h6;
        break;
      default: // 24h
        priceChange = pair.priceChange?.h24;
    }

    return {
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