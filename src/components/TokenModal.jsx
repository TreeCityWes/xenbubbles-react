import React, { useState } from 'react';
import styled from 'styled-components';
import xenLogo from '../assets/xen-logo.png';
import dbxenLogo from '../assets/dbxen-logo.png';
import treeLogo from '../assets/tree-logo.png';
import { formatPrice } from './Bubble';

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
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #39FF14;
  border-radius: 8px;
  padding: 20px;
  max-width: 90%;
  width: 500px;
  position: relative;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.3);
  z-index: 2001;

  @media (max-width: 768px) {
    max-width: 95%;
    padding: 15px;
    margin: 10px;
  }
`;

const TokenHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    text-align: center;
    margin-bottom: 12px;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin: 20px 0;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    gap: 8px;
    margin: 10px 0;
  }
`;

const ActionButton = styled.a`
  background: rgba(57, 255, 20, 0.1);
  border: 1px solid #39FF14;
  color: #39FF14;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 150px;
  justify-content: center;
  flex: 0 1 auto;

  &:hover {
    background: rgba(57, 255, 20, 0.2);
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
    flex: 1;
    min-width: calc(50% - 8px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #39FF14;
  font-size: 24px;
  cursor: pointer;
  z-index: 2002;

  &:hover {
    color: #fff;
  }
`;

const TokenLogo = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: black;
  padding: 5px;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const TokenName = styled.h2`
  color: #39FF14;
  margin: 0;
  font-size: 24px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TokenPrice = styled.div`
  color: white;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const PriceChange = styled.div`
  color: ${props => props.$positive ? '#39FF14' : '#FF3939'};
  font-size: 16px;
  margin: 0;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

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

const ChartFrame = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;

  @media (max-width: 768px) {
    height: 250px;
    flex-shrink: 0;
  }
`;

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
        <CloseButton onClick={onClose} aria-label="Close">
          <span>×</span>
        </CloseButton>
        
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
            <TokenName>{tokenSymbol}</TokenName>
            <TokenPrice>${formatPrice(tokenPrice)}</TokenPrice>
            <PriceChange $positive={priceChange >= 0}>
              {priceChange > 0 ? '+' : ''}{priceChange?.toFixed(2)}%
            </PriceChange>
          </TokenInfo>
        </TokenHeader>

        <ButtonGroup>
          {token.pairAddress && (
            <>
              <ActionButton href={dexscreenerUrl} target="_blank" rel="noopener noreferrer">
                DexScreener
              </ActionButton>
              <ActionButton href={dextoolsUrl} target="_blank" rel="noopener noreferrer">
                DexTools
              </ActionButton>
            </>
          )}
        </ButtonGroup>

        {token.pairAddress && (
          <ChartFrame
            title="DexScreener Chart"
            src={`${dexscreenerUrl}?embed=1&theme=dark`}
          />
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default TokenModal; 