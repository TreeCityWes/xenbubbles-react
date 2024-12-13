import React, { useState } from 'react';
import styled from 'styled-components';
import xenLogo from '../assets/xen-logo.png';
import dbxenLogo from '../assets/dbxen-logo.png';
import treeLogo from '../assets/tree-logo.png';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const ModalContent = styled.div`
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #39FF14;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  position: relative;
  box-shadow: 
    0 0 20px rgba(57, 255, 20, 0.3),
    inset 0 0 20px rgba(57, 255, 20, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #39FF14;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
  
  &:hover {
    color: white;
    text-shadow: 0 0 10px #39FF14;
  }
`;

const TokenHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding-bottom: 15px;
`;

const TokenLogo = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #39FF14;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
`;

const TokenInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TokenSymbol = styled.h2`
  color: #39FF14;
  margin: 0;
  font-size: 24px;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
`;

const TokenPrice = styled.div`
  color: ${props => props.priceChange >= 0 ? '#39FF14' : '#FF3939'};
  font-size: 20px;
  margin-top: 5px;
  text-shadow: 0 0 8px ${props => props.priceChange >= 0 ? 'rgba(57, 255, 20, 0.5)' : 'rgba(255, 57, 57, 0.5)'};
`;

const PriceChange = styled.div`
  color: ${props => props.positive ? '#39FF14' : '#FF3939'};
  font-size: 20px;
  margin-top: 5px;
  text-shadow: 0 0 8px ${props => props.positive ? 'rgba(57, 255, 20, 0.5)' : 'rgba(255, 57, 57, 0.5)'};
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  border: 1px solid rgba(57, 255, 20, 0.3);
  border-radius: 8px;
  overflow: hidden;
`;

const TokenDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 5px;
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ExplorerLinks = styled.div`
  display: flex;
  gap: 10px;
`;

const ExplorerLink = styled.a`
  color: #39FF14;
  text-decoration: none;
  padding: 8px 12px;
  text-align: center;
  transition: all 0.3s ease;
  font-size: 14px;
  border: 1px solid rgba(57, 255, 20, 0.3);
  border-radius: 4px;
  
  &:hover {
    background: rgba(57, 255, 20, 0.1);
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
    border-color: #39FF14;
  }
`;

const formatPrice = (num) => {
  if (!num) return '0.00';
  
  const str = num.toString();
  
  // For scientific notation (very small numbers)
  if (str.includes('e-')) {
    const [n, exp] = str.split('e-');
    const zeroCount = parseInt(exp) - 1;
    // Only use special notation for 4 or more zeros
    if (zeroCount >= 3) {
      const baseNum = (parseFloat(n) * Math.pow(10, -parseInt(exp))).toString().split('.')[1];
      const significantDigits = baseNum.slice(0, 4);
      return (
        <>
          0.0<sub>{zeroCount}</sub>{significantDigits}
        </>
      );
    }
  }
  
  // For regular decimal numbers
  if (num < 1) {
    const parts = str.split('.');
    if (parts[1]) {
      const zeros = parts[1].match(/^0+/)?.[0]?.length || 0;
      // Only use special notation for 4 or more zeros
      if (zeros >= 3) {
        const significantDigits = parts[1].slice(zeros, zeros + 4);
        return (
          <>
            0.0<sub>{zeros}</sub>{significantDigits}
          </>
        );
      }
      // For 1-2 zeros, show normally
      return parseFloat(num).toFixed(8);
    }
  }
  
  // For regular numbers
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return parseFloat(num).toFixed(4);
};

const getPlaceholderLogo = (tokenListId) => {
  switch (tokenListId) {
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

const TokenModal = ({ token, onClose }) => {
  // Move useState before any conditional returns
  const placeholderLogo = getPlaceholderLogo(token?.listId);
  const [logoSrc, setLogoSrc] = useState(token?.imageUrl || placeholderLogo);

  // Add safety checks for token data
  if (!token || !token.chain) return null;

  const dexscreenerUrl = `https://dexscreener.com/${token.chain}/${token.pairAddress}`;
  const dextoolsUrl = `https://www.dextools.io/app/${token.chain}/pair-explorer/${token.pairAddress}`;

  // Add safety checks for token properties
  const tokenSymbol = token.baseToken?.symbol || token.symbol || 'Unknown';
  const tokenPrice = token.price || 0;
  const priceChange = token.priceChange24h || 0;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <TokenHeader>
          <TokenLogo 
            src={logoSrc}
            onError={(e) => {
              e.target.onerror = null;
              setLogoSrc(placeholderLogo);
            }}
            alt={tokenSymbol}
          />
          <TokenInfo>
            <TokenSymbol>{tokenSymbol}</TokenSymbol>
            <TokenDetails>
              <PriceInfo>
                <TokenPrice>${formatPrice(tokenPrice)}</TokenPrice>
                <PriceChange positive={priceChange >= 0}>
                  {priceChange > 0 ? '+' : ''}{priceChange?.toFixed(2)}%
                </PriceChange>
              </PriceInfo>
              <ExplorerLinks>
                {token.pairAddress && (
                  <>
                    <ExplorerLink href={dexscreenerUrl} target="_blank" rel="noopener noreferrer">
                      DexScreener
                    </ExplorerLink>
                    <ExplorerLink href={dextoolsUrl} target="_blank" rel="noopener noreferrer">
                      DexTools
                    </ExplorerLink>
                  </>
                )}
              </ExplorerLinks>
            </TokenDetails>
          </TokenInfo>
        </TokenHeader>

        {token.pairAddress && (
          <ChartContainer>
            <iframe
              title="DexScreener Chart"
              src={`${dexscreenerUrl}?embed=1&theme=dark`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          </ChartContainer>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default TokenModal; 