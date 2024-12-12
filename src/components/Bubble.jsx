import React from 'react';
import styled, { keyframes } from 'styled-components';
import xenLogo from '../assets/xen-logo.png';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.3),
                inset 0 0 15px rgba(57, 255, 20, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.4),
                inset 0 0 25px rgba(57, 255, 20, 0.3);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.3),
                inset 0 0 15px rgba(57, 255, 20, 0.2);
    transform: scale(1);
  }
`;

const redPulse = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(255, 57, 57, 0.3),
                inset 0 0 15px rgba(255, 57, 57, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 57, 57, 0.4),
                inset 0 0 25px rgba(255, 57, 57, 0.3);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 57, 57, 0.3),
                inset 0 0 15px rgba(255, 57, 57, 0.2);
    transform: scale(1);
  }
`;

const BubbleContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 15px 10px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid ${props => props.priceChange >= 0 ? '#39FF14' : '#FF3939'};
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${props => props.priceChange >= 0 ? pulse : redPulse} 3s ease-in-out infinite;
  
  /* Gradient overlay */
  background: radial-gradient(
    circle at 30% 30%,
    ${props => props.priceChange >= 0 
      ? 'rgba(57, 255, 20, 0.15)' 
      : 'rgba(255, 57, 57, 0.15)'} 0%,
    rgba(0, 0, 0, 0.95) 70%
  );

  &:hover {
    transform: scale(1.02);
    border-color: white;
    box-shadow: 0 0 20px ${props => props.priceChange >= 0 
      ? 'rgba(57, 255, 20, 0.4)' 
      : 'rgba(255, 57, 57, 0.4)'};
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const TokenSymbol = styled.div`
  color: white;
  font-size: ${props => Math.max(props.size * 0.18, 14)}px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
  text-align: center;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
`;

const TokenPrice = styled.div`
  color: ${props => props.value >= 0 ? '#39FF14' : '#FF3939'};
  font-size: ${props => Math.max(props.size * 0.13, 12)}px;
  opacity: 0.9;
  text-shadow: 0 0 8px rgba(57, 255, 20, 0.6);
  margin: 2px 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
`;

const PriceChange = styled.div`
  color: ${props => props.value >= 0 ? '#39FF14' : '#FF3939'};
  font-size: ${props => Math.max(props.size * 0.12, 11)}px;
  font-weight: bold;
  text-shadow: 0 0 8px ${props => props.value >= 0 ? 'rgba(57, 255, 20, 0.6)' : 'rgba(255, 57, 57, 0.6)'};
`;

const LogoFrame = styled.div`
  width: ${props => props.size * 0.3}px;
  height: ${props => props.size * 0.3}px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.priceChange >= 0 
    ? 'rgba(57, 255, 20, 0.3)' 
    : 'rgba(255, 57, 57, 0.3)'};
  overflow: hidden;
  box-shadow: 0 0 10px ${props => props.priceChange >= 0 
    ? 'rgba(57, 255, 20, 0.2)' 
    : 'rgba(255, 57, 57, 0.2)'};
`;

const Logo = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(57, 255, 20, 0.5));
  transition: all 0.3s ease;
`;

const ZeroCount = styled.sub`
  font-size: 0.6em;
  vertical-align: sub;
  color: inherit;
  opacity: 0.9;
`;

const formatPrice = (num) => {
  if (!num) return '$0.00';
  
  const str = num.toString();
  
  // For scientific notation (very small numbers)
  if (str.includes('e-')) {
    const [n, exp] = str.split('e-');
    const zeroCount = parseInt(exp) - 1;
    const baseNum = (parseFloat(n) * Math.pow(10, -parseInt(exp))).toString().split('.')[1];
    const significantDigits = baseNum.slice(0, 4);
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
        const significantDigits = parts[1].slice(zeros, zeros + 4);
        return (
          <>
            $0.0<ZeroCount>{zeros}</ZeroCount>{significantDigits}
          </>
        );
      }
    }
  }
  
  // For regular numbers
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${parseFloat(num).toFixed(4)}`;
};

const getBubbleSize = (token, totalBubbles) => {
  const priceChange = Math.abs(token.priceChange24h || 0);
  
  // Base size for all bubbles
  const baseSize = 70; // Even smaller base size for better contrast
  
  // Exponential scaling for more dramatic size differences
  let multiplier;
  if (priceChange === 0) {
    multiplier = 0.3; // Tiny for zero movement
  } else if (priceChange < 0.5) {
    multiplier = 0.8; // Still small but noticeably bigger than 0%
  } else if (priceChange < 1) {
    multiplier = 1.2;
  } else if (priceChange < 2) {
    multiplier = 1.6;
  } else if (priceChange < 5) {
    multiplier = 2.2;
  } else if (priceChange < 10) {
    multiplier = 3.0;
  } else if (priceChange < 15) {
    multiplier = 3.8;
  } else if (priceChange < 25) {
    multiplier = 4.6;
  } else if (priceChange < 40) {
    multiplier = 5.4;
  } else {
    multiplier = 6.2; // Much larger for big moves
  }
  
  // Apply exponential scaling for more dramatic effect
  const size = baseSize * multiplier;
  
  // Ensure text remains readable even in smallest bubbles
  return Math.max(size, 25);
};

const Bubble = ({ size, color = '#39FF14', data, onClick }) => {
  const symbol = data.baseToken?.symbol || data.symbol || 'Unknown';
  const priceChange = data.priceChange24h || 0;
  const defaultLogo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${data.chain}/assets/${data.contract}/logo.png`;
  const [logoSrc, setLogoSrc] = React.useState(data.imageUrl || defaultLogo);

  const handleImageError = () => {
    setLogoSrc(xenLogo);
  };

  return (
    <BubbleContainer 
      size={size} 
      color={color} 
      priceChange={priceChange}
      onClick={() => onClick && onClick(data)}
    >
      <TopSection>
        <TokenSymbol size={size}>{symbol}</TokenSymbol>
        <TokenPrice size={size}>{formatPrice(data.price)}</TokenPrice>
        <PriceChange size={size} value={priceChange}>
          {priceChange > 0 ? '+' : ''}{priceChange?.toFixed(2)}%
        </PriceChange>
      </TopSection>

      <BottomSection>
        <LogoFrame size={size} priceChange={priceChange}>
          <Logo 
            src={logoSrc} 
            alt={symbol}
            onError={handleImageError}
          />
        </LogoFrame>
      </BottomSection>
    </BubbleContainer>
  );
};

export default Bubble; 