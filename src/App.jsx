import React from 'react';
import BubbleContainer from './components/BubbleContainer';
import CyberpunkBackground from './components/CyberpunkBackground';
import ErrorBoundary from './components/ErrorBoundary';
import styled from 'styled-components';
import './App.css';

const AppContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  color: #fff;
  padding-top: 60px;

  @media (max-width: 768px) {
    padding-top: 100px;
  }
`;

const Header = styled.header`
  background: rgba(0, 0, 0, 0.95);
  border-bottom: 1px solid #39FF14;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1500;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
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

  @media (max-width: 768px) {
    justify-content: center;
  }
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

function App() {
  return (
    <ErrorBoundary>
      <AppContainer>
        <CyberpunkBackground />
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
        <ContentWrapper>
          <BubbleContainer />
        </ContentWrapper>
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App; 