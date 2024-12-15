import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import xenLogo from '../assets/xen-logo.png';
import dbxenLogo from '../assets/dbxen-logo.png';
import treeLogo from '../assets/tree-logo.png';

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.2), inset 0 0 10px rgba(57, 255, 20, 0.1);
  }
  50% { 
    box-shadow: 0 0 25px rgba(57, 255, 20, 0.4), inset 0 0 15px rgba(57, 255, 20, 0.2);
  }
`;

const redGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 15px rgba(255, 57, 57, 0.2), inset 0 0 10px rgba(255, 57, 57, 0.1);
  }
  50% { 
    box-shadow: 0 0 25px rgba(255, 57, 57, 0.4), inset 0 0 15px rgba(255, 57, 57, 0.2);
  }
`;

const ZeroCount = styled.sub`
  font-size: 0.6em;
  vertical-align: sub;
  color: inherit;
  opacity: 0.9;
`;

const BubbleContainer = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => Math.max(props.size * 0.10, 10)}px;
  background: radial-gradient(
    circle at center,
    rgba(0,0,0,0.9),
    rgba(0,0,0,0.95)
  );
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  z-index: 2;
  box-shadow: ${props => props.$value >= 0 
    ? '0 0 20px rgba(57, 255, 20, 0.4)'
    : '0 0 20px rgba(255, 57, 57, 0.4)'};

  @media (max-width: 768px) {
    padding: ${props => Math.max(6, Math.min(props.size * 0.10, 10))}px;
    gap: ${props => Math.max(6, Math.min(props.size * 0.06, 8))}px;
    border-radius: 8px;
    background: ${props => props.$value >= 0 
      ? 'rgba(57, 255, 20, 0.15)'
      : 'rgba(255, 57, 57, 0.15)'
    };
    border: 1px solid ${props => props.$value >= 0 ? '#39FF14' : '#FF3939'};
  }
`;

const TokenSymbol = styled.div`
  color: white;
  font-size: ${props => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 3840) return Math.max(16, props.size * 0.18);
    if (screenWidth >= 2560) return Math.max(14, props.size * 0.16);
    if (screenWidth >= 1920) return Math.max(12, props.size * 0.14);
    return Math.max(11, props.size * 0.13);
  }}px;
  font-weight: bold;
  text-align: center;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  width: 100%;

  @media (max-width: 768px) {
    font-size: ${props => Math.max(11, Math.min(props.size * 0.16, 14))}px;
    margin-bottom: 2px;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 4px);
    padding: 0 2px;
  }
`;

const ChainIndicator = styled.div`
  font-size: ${props => props.size * 0.08}px;
  color: #39FF14;
  opacity: 0.8;
  margin-top: 2px;
  text-transform: uppercase;
`;

const TokenPrice = styled.div`
  color: ${props => props.$priceChange >= 0 ? '#39FF14' : '#FF3939'};
  font-size: ${props => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 3840) return Math.max(14, props.size * 0.16);
    if (screenWidth >= 2560) return Math.max(12, props.size * 0.14);
    if (screenWidth >= 1920) return Math.max(11, props.size * 0.12);
    return Math.max(10, props.size * 0.11);
  }}px;
  text-align: center;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  width: 100%;

  @media (max-width: 768px) {
    font-size: ${props => Math.max(10, Math.min(props.size * 0.14, 12))}px;
    margin: 1px 0;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
  }
`;

const PriceChange = styled.div`
  color: ${props => props.$value >= 0 ? '#39FF14' : '#FF3939'};
  font-size: ${props => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 3840) return Math.max(14, props.size * 0.16);
    if (screenWidth >= 2560) return Math.max(12, props.size * 0.14);
    if (screenWidth >= 1920) return Math.max(11, props.size * 0.12);
    return Math.max(10, props.size * 0.11);
  }}px;
  font-weight: bold;
  text-align: center;
  position: relative;
  z-index: 2;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  width: 100%;

  @media (max-width: 768px) {
    font-size: ${props => Math.max(10, Math.min(props.size * 0.14, 12))}px;
    margin-top: 1px;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
  }
`;

const LogoFrame = styled.div`
  width: ${props => props.size * 0.25}px;
  height: ${props => props.size * 0.25}px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  border-radius: 50%;
  padding: ${props => props.size * 0.03}px;
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: black;
  opacity: 0.8;
  transition: opacity 0.3s ease;
`;

const CircleBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px solid ${props => props.$priceChange >= 0 ? '#39FF14' : '#FF3939'};
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(circle at center, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
  box-shadow: ${props => props.$value >= 0 
    ? 'inset 0 0 20px rgba(57, 255, 20, 0.2)' 
    : 'inset 0 0 20px rgba(255, 57, 57, 0.2)'};

  @media (max-width: 768px) {
    display: none;
  }
`;

export const formatPrice = (num) => {
  if (!num) return '$0.00';
  
  const str = num.toString();
  
  // For scientific notation (very small numbers)
  if (str.includes('e-')) {
    const [n, exp] = str.split('e-');
    const zeroCount = parseInt(exp) - 1;
    const digits = n.replace('.', '');
    const significantDigits = digits.slice(0, 6);
    return (
      <>
        $0.0<ZeroCount>{zeroCount}</ZeroCount>{significantDigits}
      </>
    );
  }
  
  // For regular decimal numbers
  if (num < 1) {
    const parts = str.split('.');
    if (parts[1]) {
      const zeros = parts[1].match(/^0+/)?.[0]?.length || 0;
      if (zeros > 0) {
        const allDigits = parts[1].slice(zeros);
        const significantDigits = allDigits.replace(/0+$/, '');
        return (
          <>
            $0.0<ZeroCount>{zeros}</ZeroCount>{significantDigits}
          </>
        );
      }
      return `$${parseFloat(num).toString()}`;
    }
  }
  
  // For regular numbers
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${parseFloat(num).toString()}`;
};

const getLogoForList = (listId) => {
  switch (String(listId)) {
    case 'DBXen':
      return dbxenLogo;
    case 'Xen-Alts':
      return treeLogo;
    case 'Xen':
      return xenLogo;
    default:
      return xenLogo;
  }
};

const Bubble = ({ size, data, onClick, selectedTab, sizeMode }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [growFactor, setGrowFactor] = useState(1);
  const prevPriceRef = useRef(data.price);
  const isMobile = window.innerWidth <= 768;
  
  const [logoSrc, setLogoSrc] = useState(() => {
    if (data.baseToken?.logoUrl) return data.baseToken.logoUrl;
    if (data.logoUrl) return data.logoUrl;
    if (data.imageUrl) return data.imageUrl;
    return getLogoForList(data.sourceList || data.listId);
  });

  const handleImageError = useCallback(() => {
    const fallbackLogo = getLogoForList(data.sourceList || data.listId);
    setLogoSrc(fallbackLogo);
  }, [data.sourceList, data.listId]);

  useEffect(() => {
    if (prevPriceRef.current !== data.price) {
      const priceChange = ((data.price - prevPriceRef.current) / prevPriceRef.current) * 100;
      const maxGrow = 1.2;
      const minGrow = 0.8;
      const growthFactor = Math.max(minGrow, Math.min(maxGrow, 1 + (priceChange / 100)));
      
      setGrowFactor(growthFactor);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setGrowFactor(1);
      }, 500);
      
      prevPriceRef.current = data.price;
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  const formatSymbol = (symbol) => {
    if (window.innerWidth <= 768) {
      return symbol.length > 8 ? `${symbol.slice(0, 6)}...` : symbol;
    }
    return symbol;
  };

  const symbol = formatSymbol(data.baseToken?.symbol || data.symbol || 'Unknown');
  const priceChange = data.priceChange24h || 0;
  const liquidity = data.liquidity || data.liquidityUsd || 0;
  
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '$0';
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  return (
    <BubbleContainer 
      size={size} 
      $isMobile={isMobile}
      onClick={() => onClick && onClick(data)}
      $isAnimating={isAnimating}
      $growFactor={growFactor}
      $value={priceChange}
    >
      <CircleBackground $priceChange={priceChange} $value={priceChange} />
      <TokenSymbol size={size} title={data.baseToken?.symbol || data.symbol}>
        {symbol}
      </TokenSymbol>
      <TokenPrice size={size} $priceChange={priceChange}>
        {formatPrice(data.price)}
      </TokenPrice>
      <PriceChange size={size} $value={priceChange}>
        {sizeMode === 'priceChange' 
          ? `${priceChange > 0 ? '+' : ''}${priceChange?.toFixed(2)}%`
          : formatMarketCap(data.marketCap)
        }
      </PriceChange>
      {!isMobile && (
        <LogoFrame size={size}>
          <Logo 
            src={logoSrc}
            alt={symbol}
            onError={handleImageError}
            loading="lazy"
          />
        </LogoFrame>
      )}
    </BubbleContainer>
  );
};

export default Bubble; 