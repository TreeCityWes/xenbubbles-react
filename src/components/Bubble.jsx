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
  justify-content: space-between;
  padding: ${props => props.size * 0.12}px;
  background: radial-gradient(circle at center, rgba(0,0,0,0.85), rgba(0,0,0,0.95));
  border: 1px solid ${props => props.$priceChange >= 0 ? '#39FF14' : '#FF3939'};
  box-sizing: border-box;
  cursor: pointer;
  gap: ${props => props.size * 0.02}px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(${props => props.$isAnimating ? props.$growFactor : 1});
  box-shadow: ${props => 
    props.$priceChange >= 0 
      ? '0 0 15px rgba(57, 255, 20, 0.2), inset 0 0 10px rgba(57, 255, 20, 0.1)'
      : '0 0 15px rgba(255, 57, 57, 0.2), inset 0 0 10px rgba(255, 57, 57, 0.1)'
  };
  backdrop-filter: blur(4px);

  &:hover {
    box-shadow: ${props => 
      props.$priceChange >= 0 
        ? '0 0 25px rgba(57, 255, 20, 0.4), inset 0 0 15px rgba(57, 255, 20, 0.2)'
        : '0 0 25px rgba(255, 57, 57, 0.4), inset 0 0 15px rgba(255, 57, 57, 0.2)'
    };
  }

  animation: ${props => props.$priceChange >= 0 ? glow : redGlow} 2s ease-in-out infinite;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    padding: 12px;
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 8px;
    border-width: 2px;
  }
`;

const TokenSymbol = styled.div`
  color: white;
  font-size: ${props => Math.max(props.size * 0.14, 12)}px;
  font-weight: bold;
  text-align: center;
  margin-bottom: ${props => props.size * 0.02}px;
  position: relative;
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 4px;
  }
`;

const TokenPrice = styled.div`
  color: ${props => props.$priceChange >= 0 ? '#39FF14' : '#FF3939'};
  font-size: ${props => Math.max(props.size * 0.12, 10)}px;
  text-align: center;
  margin-bottom: ${props => props.size * 0.02}px;
  position: relative;
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 4px;
  }
`;

const PriceChange = styled.div`
  color: ${props => props.$value >= 0 ? '#39FF14' : '#FF3939'};
  font-size: ${props => Math.max(props.size * 0.12, 11)}px;
  font-weight: bold;
  text-align: center;
  margin-bottom: ${props => props.size * 0.02}px;
  position: relative;
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 0;
  }
`;

const LogoFrame = styled.div`
  width: ${props => props.size * 0.25}px;
  height: ${props => props.size * 0.25}px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  background: linear-gradient(135deg, rgba(57,255,20,0.1), rgba(57,255,20,0.05));
  border-radius: 50%;
  padding: ${props => props.size * 0.03}px;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(57,255,20,0.4);
  box-shadow: 0 0 8px rgba(57,255,20,0.3), inset 0 0 4px rgba(57,255,20,0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(57,255,20,0.4), inset 0 0 6px rgba(57,255,20,0.3);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin: 4px auto;
    padding: 4px;
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: black;
  opacity: 1;
  transition: opacity 0.3s ease;
`;

// Remove CircleBackground for mobile since we're using border directly
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const formatPrice = (num) => {
  if (!num) return '$0.00';
  
  const str = num.toString();
  
  // For scientific notation (very small numbers)
  if (str.includes('e-')) {
    const [n, exp] = str.split('e-');
    const zeroCount = parseInt(exp) - 1;
    // Remove decimal point and get all digits
    const digits = n.replace('.', '');
    // Make sure we get all significant digits including leading ones
    const significantDigits = digits.padEnd(6, '0').slice(0, 6);
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
        const significantDigits = allDigits.padEnd(6, '0').slice(0, 6);
        return (
          <>
            $0.0<ZeroCount>{zeros}</ZeroCount>{significantDigits}
          </>
        );
      }
    }
    return `$${parseFloat(num).toFixed(6)}`;
  }
  
  // For regular numbers
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${parseFloat(num).toFixed(4)}`;
};

const getLogoForList = (listId) => {
  switch (String(listId)) {
    case 'DBXen':
      console.log('Using DBXen logo for', listId);
      return dbxenLogo;
    case 'Xen-Alts':
      console.log('Using Xen-Alts logo for', listId);
      return treeLogo;
    case 'Xen':
      console.log('Using Xen logo for', listId);
      return xenLogo;
    default:
      console.log('Using default logo for', listId);
      return xenLogo;
  }
};

const Bubble = ({ size, data, onClick, selectedTab }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [growFactor, setGrowFactor] = useState(1);
  const prevPriceRef = useRef(data.price);
  
  useEffect(() => {
    // If price has changed
    if (prevPriceRef.current !== data.price) {
      const priceChange = ((data.price - prevPriceRef.current) / prevPriceRef.current) * 100;
      
      // Calculate grow factor based on price change
      // You can adjust these values to control animation intensity
      const maxGrow = 1.2; // Maximum growth
      const minGrow = 0.8; // Maximum shrink
      const growthFactor = Math.max(minGrow, Math.min(maxGrow, 1 + (priceChange / 100)));
      
      setGrowFactor(growthFactor);
      setIsAnimating(true);
      
      // Reset animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setGrowFactor(1);
      }, 500); // Match this with the transition duration
      
      prevPriceRef.current = data.price;
      
      return () => clearTimeout(timer);
    }
  }, [data.price]);

  const symbol = data.baseToken?.symbol || data.symbol || 'Unknown';
  const priceChange = data.priceChange24h || 0;
  
  // Try to get logo in this priority: DexScreener -> TrustWallet -> list-specific logo
  const [logoSrc, setLogoSrc] = React.useState(() => {
    // First try DexScreener logo
    if (data.imageUrl) return data.imageUrl;
    
    // Then try list-specific logo based on sourceList
    return getLogoForList(data.sourceList || data.listId);
  });

  const handleImageError = useCallback(() => {
    const fallbackLogo = getLogoForList(data.sourceList || data.listId);
    setLogoSrc(fallbackLogo);
  }, [data.sourceList, data.listId]);

  return (
    <BubbleContainer 
      size={size} 
      $priceChange={priceChange}
      onClick={() => onClick && onClick(data)}
      $isAnimating={isAnimating}
      $growFactor={growFactor}
    >
      <CircleBackground $priceChange={priceChange} />
      <TokenSymbol size={size}>{symbol}</TokenSymbol>
      <TokenPrice size={size} $priceChange={priceChange}>
        {formatPrice(data.price)}
      </TokenPrice>
      <PriceChange size={size} $value={priceChange}>
        {priceChange > 0 ? '+' : ''}{priceChange?.toFixed(2)}%
      </PriceChange>
      <LogoFrame size={size}>
        <Logo 
          src={logoSrc}
          alt={symbol}
          onError={handleImageError}
          loading="lazy"
        />
      </LogoFrame>
    </BubbleContainer>
  );
};

export default Bubble; 