import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid #39FF14;
  z-index: 100;
`;

const AddressLink = styled.a`
  color: #39FF14;
  text-decoration: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    color: #45ff24;
    text-decoration: underline;
  }
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;

const Footer = () => {
  const addresses = {
    ETH: '0xe4bB...9bC',
    BTC: 'bctq...5g',
    SOL: '8bXf...6x'
  };

  return (
    <FooterContainer>
      {Object.entries(addresses).map(([chain, address]) => (
        <AddressLink 
          key={chain}
          href={`#${chain.toLowerCase()}`}
          title={`${chain} Address`}
        >
          {chain}: {address}
        </AddressLink>
      ))}
    </FooterContainer>
  );
};

export default Footer; 