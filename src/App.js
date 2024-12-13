import React from 'react';
import BubbleContainer from './components/BubbleContainer';
import CyberpunkBackground from './components/CyberpunkBackground';
import ErrorBoundary from './components/ErrorBoundary';
import styled from 'styled-components';

const AppContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  color: #fff;
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const Header = styled.header`
  background: rgba(0, 0, 0, 0.95);
  border-bottom: 1px solid #39FF14;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.a`
  color: #39FF14;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  
  &:hover {
    text-shadow: 0 0 20px rgba(57, 255, 20, 0.8);
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: #39FF14;
    text-decoration: none;
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      text-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
      color: #fff;
    }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding-top: 80px; // Add padding to account for fixed header
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    padding-top: 0;
  }
`;

const MobileHeader = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0.9);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    border-bottom: 1px solid #39FF14;
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  }
`;

const HeaderTitle = styled.div`
  color: #39FF14;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  grid-column: 2;
  text-align: center;
`;

function App() {
  return (
    <ErrorBoundary>
      <AppContainer>
        <CyberpunkBackground />
        
        {/* Desktop Header */}
        <Header>
          <HeaderContainer>
            <Nav>
              <Logo href="/">HashHead.io</Logo>
              <NavLinks>
                <a href="https://store.hashhead.io">Store</a>
                <a href="https://twitter.com/TreeCityWes">Twitter</a>
                <a href="https://github.com/TreeCityWes/">GitHub</a>
                <a href="/cdn-cgi/l/email-protection#3b4c5e487b4f495e5e58524f424f495a5f52555c154e48">Contact</a>
              </NavLinks>
            </Nav>
          </HeaderContainer>
        </Header>
        
        {/* Mobile Header */}
        <MobileHeader>
          <HeaderTitle>HashHead.io</HeaderTitle>
        </MobileHeader>
        
        <ContentWrapper>
          <BubbleContainer />
        </ContentWrapper>
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App; 