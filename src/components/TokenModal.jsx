import React from 'react';
import styled from 'styled-components';

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
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #39FF14;
  border-radius: 12px;
  padding: 20px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.2),
              inset 0 0 30px rgba(57, 255, 20, 0.1);
  
  /* Terminal header styling */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: rgba(57, 255, 20, 0.1);
    border-bottom: 1px solid #39FF14;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 10px;
  background: transparent;
  border: none;
  color: #39FF14;
  font-size: 20px;
  cursor: pointer;
  z-index: 1;
  text-shadow: 0 0 5px #39FF14;
  
  &:hover {
    color: white;
    text-shadow: 0 0 8px #39FF14;
  }
`;

const TokenInfo = styled.div`
  margin-top: 20px;
  color: #39FF14;
  text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
`;

const LinkSection = styled.div`
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const LinkButton = styled.a`
  background: transparent;
  border: 1px solid #39FF14;
  color: #39FF14;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
  
  &:hover {
    background: rgba(57, 255, 20, 0.1);
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
  }
`;

const ChartContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #39FF14;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
`;

const TokenModal = ({ token, onClose }) => {
  // Construct DexScreener URL
  const dexscreenerUrl = token.chain && token.pairAddress 
    ? `https://dexscreener.com/${token.chain}/${token.pairAddress}`
    : null;
  
  // Construct embed URL with chart settings
  const embedUrl = dexscreenerUrl 
    ? `${dexscreenerUrl}?embed=1&theme=dark&chartStyle=candlesticks&chartType=candles`
    : null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <TokenInfo>
          <h2>{token.symbol} ({token.chain})</h2>
          <LinkSection>
            {token.websites?.map((site, index) => (
              <LinkButton 
                key={index} 
                href={site.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Website
              </LinkButton>
            ))}
            
            {token.socials?.map((social, index) => (
              <LinkButton 
                key={index}
                href={`https://${social.platform}.com/${social.handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
              </LinkButton>
            ))}

            {dexscreenerUrl && (
              <LinkButton 
                href={dexscreenerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                DexScreener
              </LinkButton>
            )}
          </LinkSection>
          
          {embedUrl && (
            <ChartContainer>
              <iframe
                title="DexScreener Chart"
                width="100%"
                height="600px"
                src={embedUrl}
                style={{ border: 'none' }}
              />
            </ChartContainer>
          )}
        </TokenInfo>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TokenModal; 