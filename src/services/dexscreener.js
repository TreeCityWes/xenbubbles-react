const BASE_URL = 'https://api.dexscreener.com/latest';

export const fetchTokenData = async (chain, contractAddress) => {
  try {
    const response = await fetch(`${BASE_URL}/dex/tokens/${contractAddress}`);
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const chainPair = data.pairs.find(pair => pair.chainId.toLowerCase() === chain.toLowerCase()) || data.pairs[0];
      const baseToken = chainPair.baseToken;
      
      return {
        symbol: baseToken.symbol,
        chain: chain,
        chainId: chainPair.chainId,
        contract: contractAddress,
        price: chainPair.priceUsd,
        priceChange24h: chainPair.priceChange?.h24,
        volume24h: chainPair.volume?.h24,
        liquidity: chainPair.liquidity?.usd,
        marketCap: chainPair.marketCap,
        fdv: chainPair.fdv,
        imageUrl: baseToken.logoURI || chainPair.info?.imageUrl,
        dexId: chainPair.dexId,
        pairAddress: chainPair.pairAddress,
        websites: chainPair.info?.websites,
        socials: chainPair.info?.socials,
        color: getColorFromPriceChange(chainPair.priceChange?.h24)
      };
    }
    
    return null;
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