import React, { useState } from 'react';
import BubbleContainer from './components/BubbleContainer';
import Layout from './components/Layout';
import styled from 'styled-components';

const MobileHeader = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 60px;
    padding: 0 20px;
    background: #000;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    border-bottom: 2px solid #39FF14;
  }
`;

const HeaderTitle = styled.div`
  color: #39FF14;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  font-family: monospace;
`;

const MenuButton = styled.button`
  font-size: 24px;
  color: #39FF14;
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
`;

const MobileDisclaimer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    text-align: center;
    padding: 8px;
    background: rgba(57, 255, 20, 0.1);
    color: #39FF14;
    font-size: 12px;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 999;
  }
`;

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <Layout>
      <MobileHeader>
        <HeaderTitle>HashHead.io</HeaderTitle>
        <MenuButton 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </MenuButton>
      </MobileHeader>
      <MobileDisclaimer>
        ⓘ Optimized for desktop viewing. Mobile experience may be limited.
      </MobileDisclaimer>
      <BubbleContainer />
    </Layout>
  );
}

export default App; 